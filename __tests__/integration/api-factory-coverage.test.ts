/**
 * API Factory/Fp 层覆盖率测试
 * 这些层是 OpenAPI Generator 自动生成的薄封装，通过 mock axios 验证调用链正确性
 * 覆盖 HistoryApiFactory/Fp、RecycledApiFactory/Fp、QuotaApiFactory/Fp、
 * FileApiFactory/Fp、DirectoryApiFactory/Fp、SpaceApiFactory/Fp、
 * BatchApiFactory/Fp、TokenApiFactory/Fp、UsageApiFactory/Fp、TaskApiFactory/Fp
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosInstance, AxiosResponse } from 'axios';

// ─── mock axios ──────────────────────────────────────────
function createMockAxios(): AxiosInstance {
  const mockResponse: AxiosResponse = {
    data: { ok: true },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
  const instance = vi.fn().mockResolvedValue(mockResponse) as any;
  instance.request = vi.fn().mockResolvedValue(mockResponse);
  instance.get = vi.fn().mockResolvedValue(mockResponse);
  instance.post = vi.fn().mockResolvedValue(mockResponse);
  instance.put = vi.fn().mockResolvedValue(mockResponse);
  instance.delete = vi.fn().mockResolvedValue(mockResponse);
  instance.patch = vi.fn().mockResolvedValue(mockResponse);
  instance.defaults = { headers: { common: {} } };
  return instance;
}

const MOCK_BASE = 'https://mock.smh.test';

// ─── HistoryApi ──────────────────────────────────────────

import {
  HistoryApiFp,
  HistoryApiFactory,
} from '../../apis/history-api';

describe('HistoryApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('HistoryApiFp', () => {
    const fp = HistoryApiFp();

    it('deleteHistory 应返回可调用函数', async () => {
      const fn = await fp.deleteHistory('lib-1', 'space-1', 'token', ['h1']);
      expect(typeof fn).toBe('function');
      const result = await fn(mockAxios, MOCK_BASE);
      expect(result).toBeDefined();
    });

    it('emptyHistory 应返回可调用函数', async () => {
      const fn = await fp.emptyHistory('lib-1', 'token');
      const result = await fn(mockAxios, MOCK_BASE);
      expect(result).toBeDefined();
    });

    it('getHistoryConfig 应返回可调用函数', async () => {
      const fn = await fp.getHistoryConfig('lib-1', 'token');
      const result = await fn(mockAxios, MOCK_BASE);
      expect(result).toBeDefined();
    });

    it('listHistory 应返回可调用函数', async () => {
      const fn = await fp.listHistory('lib-1', 'space-1', 'test.txt', 'token');
      const result = await fn(mockAxios, MOCK_BASE);
      expect(result).toBeDefined();
    });

    it('setHistoryConfig 应返回可调用函数', async () => {
      const fn = await fp.setHistoryConfig('lib-1', 'token', { enableFileHistory: true } as any);
      const result = await fn(mockAxios, MOCK_BASE);
      expect(result).toBeDefined();
    });

    it('setHistoryLatest 应返回可调用函数', async () => {
      const fn = await fp.setHistoryLatest('lib-1', 'space-1', 'h-1', 'token');
      const result = await fn(mockAxios, MOCK_BASE);
      expect(result).toBeDefined();
    });
  });

  describe('HistoryApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = HistoryApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.deleteHistory({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token', requestBody: ['h1'],
      })).resolves.toBeDefined();

      await expect(factory.emptyHistory({
        libraryId: 'lib-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getHistoryConfig({
        libraryId: 'lib-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.listHistory({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'test.txt', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.setHistoryConfig({
        libraryId: 'lib-1', accessToken: 'token', setHistoryConfigRequest: { enableFileHistory: true } as any,
      })).resolves.toBeDefined();

      await expect(factory.setHistoryLatest({
        libraryId: 'lib-1', spaceId: 'space-1', historyId: 'h-1', accessToken: 'token',
      })).resolves.toBeDefined();
    });
  });
});

// ─── RecycledApi ─────────────────────────────────────────

import {
  RecycledApiFp,
  RecycledApiFactory,
  RecycleListByMarkerEnum,
  RecycleListByPageByPageEnum,
  RecycleRestoreRestoreEnum,
} from '../../apis/recycled-api';

describe('RecycledApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('RecycledApiFp', () => {
    const fp = RecycledApiFp();

    it('recycleEmpty 应返回可调用函数', async () => {
      const fn = await fp.recycleEmpty('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recycleInfo 应返回可调用函数', async () => {
      const fn = await fp.recycleInfo('lib-1', 'space-1', 42, 1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recycleList 应返回可调用函数', async () => {
      const fn = await fp.recycleList('lib-1', 'space-1', RecycleListByMarkerEnum.NUMBER_1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recycleListByPage 应返回可调用函数', async () => {
      const fn = await fp.recycleListByPage('lib-1', 'space-1', RecycleListByPageByPageEnum.NUMBER_1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recyclePreview 应返回可调用函数', async () => {
      const fn = await fp.recyclePreview('lib-1', 'space-1', 42, 1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recyclePurge 应返回可调用函数', async () => {
      const fn = await fp.recyclePurge('lib-1', 'space-1', 42, 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recyclePurgeBatch 应返回可调用函数', async () => {
      const fn = await fp.recyclePurgeBatch('lib-1', 'space-1', 1, 'token', [1, 2]);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recycleRestore 应返回可调用函数', async () => {
      const fn = await fp.recycleRestore('lib-1', 'space-1', 42, RecycleRestoreRestoreEnum.NUMBER_1, 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recycleRestoreBatch 应返回可调用函数', async () => {
      const fn = await fp.recycleRestoreBatch('lib-1', 'space-1', 1, 'token', [1, 2]);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('recycleSetLifecycle 应返回可调用函数', async () => {
      const fn = await fp.recycleSetLifecycle('lib-1', 'space-1', 1, 'token', { retentionDays: 30 } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('RecycledApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = RecycledApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.recycleEmpty({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.recycleInfo({
        libraryId: 'lib-1', spaceId: 'space-1', recycledItemId: 42, info: 1,
      })).resolves.toBeDefined();

      await expect(factory.recycleList({
        libraryId: 'lib-1', spaceId: 'space-1', byMarker: RecycleListByMarkerEnum.NUMBER_1,
      })).resolves.toBeDefined();

      await expect(factory.recycleListByPage({
        libraryId: 'lib-1', spaceId: 'space-1', byPage: RecycleListByPageByPageEnum.NUMBER_1,
      })).resolves.toBeDefined();

      await expect(factory.recyclePreview({
        libraryId: 'lib-1', spaceId: 'space-1', recycledItemId: 42, preview: 1,
      })).resolves.toBeDefined();

      await expect(factory.recyclePurge({
        libraryId: 'lib-1', spaceId: 'space-1', recycledItemId: 42, accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.recyclePurgeBatch({
        libraryId: 'lib-1', spaceId: 'space-1', _delete: 1, accessToken: 'token', recyclePurgeBatchRequest: [1],
      })).resolves.toBeDefined();

      await expect(factory.recycleRestore({
        libraryId: 'lib-1', spaceId: 'space-1', recycledItemId: 42, restore: RecycleRestoreRestoreEnum.NUMBER_1, accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.recycleRestoreBatch({
        libraryId: 'lib-1', spaceId: 'space-1', restore: 1, accessToken: 'token', recycleRestoreBatchRequest: [1],
      })).resolves.toBeDefined();

      await expect(factory.recycleSetLifecycle({
        libraryId: 'lib-1', spaceId: 'space-1', lifecycle: 1, accessToken: 'token', recycleSetLifecycleRequest: { retentionDays: 30 } as any,
      })).resolves.toBeDefined();
    });
  });
});

// ─── QuotaApi ────────────────────────────────────────────

import {
  QuotaApiFp,
  QuotaApiFactory,
} from '../../apis/quota-api';

describe('QuotaApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('QuotaApiFp', () => {
    const fp = QuotaApiFp();

    it('createQuota 应返回可调用函数', async () => {
      const fn = await fp.createQuota('lib-1', 'token', { capacity: '1024', removeWhenExceed: false, removeAfterDays: 30, spaces: ['s1'] } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getQuota 应返回可调用函数', async () => {
      const fn = await fp.getQuota('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getQuotaInfo 应返回可调用函数', async () => {
      const fn = await fp.getQuotaInfo('lib-1', 'quota-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('updateQuota 应返回可调用函数', async () => {
      const fn = await fp.updateQuota('lib-1', 'space-1', 'token', { capacity: '2048' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('updateQuotaById 应返回可调用函数', async () => {
      const fn = await fp.updateQuotaById('lib-1', 'quota-1', 'token', { capacity: '2048' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('QuotaApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = QuotaApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.createQuota({
        libraryId: 'lib-1', accessToken: 'token',
        createQuotaRequest: { capacity: '1024', removeWhenExceed: false, removeAfterDays: 30, spaces: ['s1'] } as any,
      })).resolves.toBeDefined();

      await expect(factory.getQuota({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getQuotaInfo({
        libraryId: 'lib-1', quotaId: 'q-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.updateQuota({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
        updateQuotaRequest: { capacity: '2048' } as any,
      })).resolves.toBeDefined();

      await expect(factory.updateQuotaById({
        libraryId: 'lib-1', quotaId: 'q-1', accessToken: 'token',
        updateQuotaByIdRequest: { capacity: '2048' } as any,
      })).resolves.toBeDefined();
    });
  });
});

// ─── FileApi ─────────────────────────────────────────────

import {
  FileApiFp,
  FileApiFactory,
  MultipartUploadFileMultipartEnum,
  GetFileUploadUploadEnum,
  AbortFileUploadUploadEnum,
  RenewMultipartUploadRenewEnum,
  PreviewFilePreviewEnum,
  ConvertFileConvertEnum,
  InfoFileInfoEnum,
  CompleteFileUploadConfirmEnum,
} from '../../apis/file-api';

describe('FileApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('FileApiFp', () => {
    const fp = FileApiFp();

    it('abortFileUpload', async () => {
      const fn = await fp.abortFileUpload('lib-1', 'space-1', 'ck-1', AbortFileUploadUploadEnum.NUMBER_1, 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('checkFileDeletion', async () => {
      const fn = await fp.checkFileDeletion('lib-1', 'space-1', 'inode-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('checkFileStatus', async () => {
      const fn = await fp.checkFileStatus('lib-1', 'space-1', 'test.txt', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('completeFileUpload', async () => {
      const fn = await fp.completeFileUpload('lib-1', 'space-1', 'ck-1', CompleteFileUploadConfirmEnum.NUMBER_1, 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('convertFile', async () => {
      const fn = await fp.convertFile('lib-1', 'space-1', 'test.docx', ConvertFileConvertEnum.NUMBER_1, 'token', { convertFrom: 'test.docx' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('copyFile', async () => {
      const fn = await fp.copyFile('lib-1', 'space-1', 'dest.txt', 'token', { copyFrom: 'src.txt' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('createSymlink', async () => {
      const fn = await fp.createSymlink('lib-1', 'space-1', 'link.txt', 'token', { linkTo: 'real.txt' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('deleteFile', async () => {
      const fn = await fp.deleteFile('lib-1', 'space-1', 'test.txt', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('downloadFile', async () => {
      const fn = await fp.downloadFile('lib-1', 'space-1', 'test.txt');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('formUploadFile', async () => {
      const fn = await fp.formUploadFile('lib-1', 'space-1', 'test.txt', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getCover', async () => {
      const fn = await fp.getCover('lib-1', 'space-1', 'photo.jpg', 1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getFileInfoByInode', async () => {
      const fn = await fp.getFileInfoByInode('lib-1', 'space-1', 'inode-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getFileUpload', async () => {
      const fn = await fp.getFileUpload('lib-1', 'space-1', 'ck-1', GetFileUploadUploadEnum.NUMBER_1, 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('infoFile', async () => {
      const fn = await fp.infoFile('lib-1', 'space-1', 'test.txt', InfoFileInfoEnum.NUMBER_1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('moveFile', async () => {
      const fn = await fp.moveFile('lib-1', 'space-1', 'dest.txt', 'token', { from: 'src.txt' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('multipartUploadFile', async () => {
      const fn = await fp.multipartUploadFile('lib-1', 'space-1', 'big.bin', MultipartUploadFileMultipartEnum.NUMBER_1, 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('previewFile', async () => {
      const fn = await fp.previewFile('lib-1', 'space-1', 'doc.pdf', PreviewFilePreviewEnum.NUMBER_1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('renewMultipartUpload', async () => {
      const fn = await fp.renewMultipartUpload('lib-1', 'space-1', 'ck-1', RenewMultipartUploadRenewEnum.NUMBER_1, 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('simpleUploadFile', async () => {
      const fn = await fp.simpleUploadFile('lib-1', 'space-1', 'test.txt', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('FileApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = FileApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.abortFileUpload({
        libraryId: 'lib-1', spaceId: 'space-1', confirmKey: 'ck-1', upload: AbortFileUploadUploadEnum.NUMBER_1, accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.checkFileDeletion({
        libraryId: 'lib-1', spaceId: 'space-1', inode: 'inode-1', accessToken: 'token',
      } as any)).resolves.toBeDefined();

      await expect(factory.checkFileStatus({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'test.txt', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.completeFileUpload({
        libraryId: 'lib-1', spaceId: 'space-1', confirmKey: 'ck-1', confirm: CompleteFileUploadConfirmEnum.NUMBER_1, accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.convertFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'doc.docx', convert: ConvertFileConvertEnum.NUMBER_1, accessToken: 'token',
        convertFileRequest: { convertFrom: 'doc.docx' } as any,
      })).resolves.toBeDefined();

      await expect(factory.copyFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'dest.txt', accessToken: 'token',
        copyFileRequest: { copyFrom: 'src.txt' } as any,
      })).resolves.toBeDefined();

      await expect(factory.createSymlink({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'link.txt', accessToken: 'token',
        createSymlinkRequest: { linkTo: 'real.txt' } as any,
      })).resolves.toBeDefined();

      await expect(factory.deleteFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'test.txt', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.downloadFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'test.txt',
      })).resolves.toBeDefined();

      await expect(factory.formUploadFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'test.txt', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getCover({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'photo.jpg', preview: 1,
      })).resolves.toBeDefined();

      await expect(factory.getFileInfoByInode({
        libraryId: 'lib-1', spaceId: 'space-1', iNode: 'inode-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getFileUpload({
        libraryId: 'lib-1', spaceId: 'space-1', confirmKey: 'ck-1', upload: GetFileUploadUploadEnum.NUMBER_1, accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.infoFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'test.txt', info: InfoFileInfoEnum.NUMBER_1,
      })).resolves.toBeDefined();

      await expect(factory.moveFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'dest.txt', accessToken: 'token',
        moveFileRequest: { from: 'src.txt' } as any,
      })).resolves.toBeDefined();

      await expect(factory.multipartUploadFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'big.bin', multipart: MultipartUploadFileMultipartEnum.NUMBER_1, accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.previewFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'doc.pdf', preview: PreviewFilePreviewEnum.NUMBER_1,
      })).resolves.toBeDefined();

      await expect(factory.renewMultipartUpload({
        libraryId: 'lib-1', spaceId: 'space-1', confirmKey: 'ck-1', renew: RenewMultipartUploadRenewEnum.NUMBER_1, accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.simpleUploadFile({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'test.txt', accessToken: 'token',
      })).resolves.toBeDefined();
    });
  });
});

// ─── DirectoryApi ────────────────────────────────────────

import {
  DirectoryApiFp,
  DirectoryApiFactory,
  ListDirectoryByMarkerEnum,
  ListDirectoryByPageByPageEnum,
  InfoFileOrDirectoryInfoEnum,
  UpdateDirectoryLabelsUpdateEnum,
} from '../../apis/directory-api';

describe('DirectoryApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('DirectoryApiFp', () => {
    const fp = DirectoryApiFp();

    it('checkDirectoryStatus', async () => {
      const fn = await fp.checkDirectoryStatus('lib-1', 'space-1', 'dir1');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('copyDirectory', async () => {
      const fn = await fp.copyDirectory('lib-1', 'space-1', 'dest-dir', 'token', { copyFrom: 'src-dir' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('createDirectory', async () => {
      const fn = await fp.createDirectory('lib-1', 'space-1', 'new-dir', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('deleteDirectory', async () => {
      const fn = await fp.deleteDirectory('lib-1', 'space-1', 'del-dir', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('infoFileOrDirectory', async () => {
      const fn = await fp.infoFileOrDirectory('lib-1', 'space-1', 'some-path', InfoFileOrDirectoryInfoEnum.NUMBER_1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('listDirectory', async () => {
      const fn = await fp.listDirectory('lib-1', 'space-1', 'dir1', ListDirectoryByMarkerEnum.NUMBER_1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('listDirectoryByPage', async () => {
      const fn = await fp.listDirectoryByPage('lib-1', 'space-1', 'dir1', ListDirectoryByPageByPageEnum.NUMBER_1);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('moveDirectory', async () => {
      const fn = await fp.moveDirectory('lib-1', 'space-1', 'dest-dir', 'token', { from: 'src-dir' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('updateDirectoryLabels', async () => {
      const fn = await fp.updateDirectoryLabels('lib-1', 'space-1', 'dir1', UpdateDirectoryLabelsUpdateEnum.NUMBER_1, 'token', { labels: ['a'] } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('updateFileLabels', async () => {
      const fn = await fp.updateFileLabels('lib-1', 'space-1', 'file.txt', 1 as any, { labels: ['a'] } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('DirectoryApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = DirectoryApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.checkDirectoryStatus({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'dir1',
      })).resolves.toBeDefined();

      await expect(factory.copyDirectory({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'dest', accessToken: 'token',
        copyDirectoryRequest: { copyFrom: 'src' } as any,
      })).resolves.toBeDefined();

      await expect(factory.createDirectory({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'new-dir', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.deleteDirectory({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'del-dir', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.infoFileOrDirectory({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'path', info: InfoFileOrDirectoryInfoEnum.NUMBER_1,
      })).resolves.toBeDefined();

      await expect(factory.listDirectory({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'dir1', byMarker: ListDirectoryByMarkerEnum.NUMBER_1,
      })).resolves.toBeDefined();

      await expect(factory.listDirectoryByPage({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'dir1', byPage: ListDirectoryByPageByPageEnum.NUMBER_1,
      })).resolves.toBeDefined();

      await expect(factory.moveDirectory({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'dest', accessToken: 'token',
        moveDirectoryRequest: { from: 'src' } as any,
      })).resolves.toBeDefined();

      await expect(factory.updateDirectoryLabels({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'dir1', update: UpdateDirectoryLabelsUpdateEnum.NUMBER_1, accessToken: 'token',
        updateDirectoryLabelsRequest: { labels: ['a'] } as any,
      })).resolves.toBeDefined();

      await expect(factory.updateFileLabels({
        libraryId: 'lib-1', spaceId: 'space-1', filePath: 'file.txt', update: 1 as any,
        updateFileLabelsRequest: { labels: ['a'] } as any,
      })).resolves.toBeDefined();
    });
  });
});

// ─── SpaceApi ────────────────────────────────────────────

import {
  SpaceApiFp,
  SpaceApiFactory,
  GetContentsViewFilterEnum,
} from '../../apis/space-api';

describe('SpaceApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('SpaceApiFp', () => {
    const fp = SpaceApiFp();

    it('createSpace', async () => {
      const fn = await fp.createSpace('lib-1', 'token', { extensions: {} } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('deleteSpace', async () => {
      const fn = await fp.deleteSpace('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getContentsView', async () => {
      const fn = await fp.getContentsView('lib-1', 'space-1', GetContentsViewFilterEnum.OnlyFile, undefined, undefined, undefined, undefined, undefined, 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getFileCountInSpace', async () => {
      const fn = await fp.getFileCountInSpace('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getLibrarySpaceCount', async () => {
      const fn = await fp.getLibrarySpaceCount('lib-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getSpaceExtension', async () => {
      const fn = await fp.getSpaceExtension('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getSpaceSize', async () => {
      const fn = await fp.getSpaceSize('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('listSpace', async () => {
      const fn = await fp.listSpace('lib-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('setSpaceTrafficLimit', async () => {
      const fn = await fp.setSpaceTrafficLimit('lib-1', 'space-1', 'token', { trafficLimit: 1024 } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('updateSpaceExtension', async () => {
      const fn = await fp.updateSpaceExtension('lib-1', 'space-1', 'token', { extensions: {} } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('SpaceApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = SpaceApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.createSpace({
        libraryId: 'lib-1', accessToken: 'token', createSpaceRequest: { extensions: {} } as any,
      })).resolves.toBeDefined();

      await expect(factory.deleteSpace({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getContentsView({
        libraryId: 'lib-1', spaceId: 'space-1', filter: GetContentsViewFilterEnum.OnlyFile, accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getFileCountInSpace({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getLibrarySpaceCount({
        libraryId: 'lib-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getSpaceExtension({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getSpaceSize({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.listSpace({
        libraryId: 'lib-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.setSpaceTrafficLimit({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
        setSpaceTrafficLimitRequest: { trafficLimit: 1024 } as any,
      })).resolves.toBeDefined();

      await expect(factory.updateSpaceExtension({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
        updateSpaceExtensionRequest: { extensions: {} } as any,
      })).resolves.toBeDefined();
    });
  });
});

// ─── BatchApi ────────────────────────────────────────────

import {
  BatchApiFp,
  BatchApiFactory,
  BatchCopyCopyEnum,
  BatchDeleteDeleteEnum,
  BatchMoveMoveEnum,
} from '../../apis/batch-api';

describe('BatchApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('BatchApiFp', () => {
    const fp = BatchApiFp();

    it('batchCopy', async () => {
      const fn = await fp.batchCopy('lib-1', 'space-1', BatchCopyCopyEnum.NUMBER_1, 'token', []);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('batchDelete', async () => {
      const fn = await fp.batchDelete('lib-1', 'space-1', BatchDeleteDeleteEnum.NUMBER_1, 'token', []);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('batchMove', async () => {
      const fn = await fp.batchMove('lib-1', 'space-1', BatchMoveMoveEnum.NUMBER_1, 'token', []);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('BatchApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = BatchApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.batchCopy({
        libraryId: 'lib-1', spaceId: 'space-1', copy: BatchCopyCopyEnum.NUMBER_1, accessToken: 'token',
        batchCopyRequest: [],
      })).resolves.toBeDefined();

      await expect(factory.batchDelete({
        libraryId: 'lib-1', spaceId: 'space-1', _delete: BatchDeleteDeleteEnum.NUMBER_1, accessToken: 'token',
        batchDeleteRequest: [],
      })).resolves.toBeDefined();

      await expect(factory.batchMove({
        libraryId: 'lib-1', spaceId: 'space-1', move: BatchMoveMoveEnum.NUMBER_1, accessToken: 'token',
        batchMoveRequest: [],
      })).resolves.toBeDefined();
    });
  });
});

// ─── TokenApi ────────────────────────────────────────────

import {
  TokenApiFp,
  TokenApiFactory,
  CreateTokenGrantEnum,
} from '../../apis/token-api';

describe('TokenApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('TokenApiFp', () => {
    const fp = TokenApiFp();

    it('createToken', async () => {
      const fn = await fp.createToken('lib-1', 'secret');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('deleteToken', async () => {
      const fn = await fp.deleteToken('lib-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('deleteUserTokens', async () => {
      const fn = await fp.deleteUserTokens('lib-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('renewToken', async () => {
      const fn = await fp.renewToken('lib-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('TokenApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = TokenApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.createToken({
        libraryId: 'lib-1', librarySecret: 'secret',
      })).resolves.toBeDefined();

      await expect(factory.deleteToken({
        libraryId: 'lib-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.deleteUserTokens({
        libraryId: 'lib-1', librarySecret: 'secret',
      })).resolves.toBeDefined();

      await expect(factory.renewToken({
        libraryId: 'lib-1', accessToken: 'token',
      })).resolves.toBeDefined();
    });
  });
});

// ─── UsageApi ────────────────────────────────────────────

import {
  UsageApiFp,
  UsageApiFactory,
} from '../../apis/usage-api';

describe('UsageApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('UsageApiFp', () => {
    const fp = UsageApiFp();

    it('getLibraryUsage', async () => {
      const fn = await fp.getLibraryUsage('lib-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('getUsage', async () => {
      const fn = await fp.getUsage('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('UsageApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = UsageApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.getLibraryUsage({
        libraryId: 'lib-1', accessToken: 'token',
      })).resolves.toBeDefined();

      await expect(factory.getUsage({
        libraryId: 'lib-1', spaceIds: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();
    });
  });
});

// ─── TaskApi ─────────────────────────────────────────────

import {
  TaskApiFp,
  TaskApiFactory,
} from '../../apis/task-api';

describe('TaskApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('TaskApiFp', () => {
    const fp = TaskApiFp();

    it('queryLibraryTask', async () => {
      const fn = await fp.queryLibraryTask('lib-1', '42', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('queryTask', async () => {
      const fn = await fp.queryTask('lib-1', 'space-1', '42', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('TaskApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = TaskApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.queryLibraryTask({
        libraryId: 'lib-1', accessToken: 'token', taskIdList: '42',
      })).resolves.toBeDefined();

      await expect(factory.queryTask({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token', taskIdList: '42',
      })).resolves.toBeDefined();
    });
  });
});

// ─── FavoriteApi ─────────────────────────────────────────

import {
  FavoriteApiFp,
  FavoriteApiFactory,
  DeleteFavoriteCancelEnum,
} from '../../apis/favorite-api';

describe('FavoriteApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('FavoriteApiFp', () => {
    const fp = FavoriteApiFp();

    it('createFavorite', async () => {
      const fn = await fp.createFavorite('lib-1', 'space-1', 'token', { path: 'test.txt' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('deleteFavorite', async () => {
      const fn = await fp.deleteFavorite('lib-1', 'space-1', 'token', DeleteFavoriteCancelEnum.NUMBER_1, { path: 'test.txt' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });

    it('listFavorite', async () => {
      const fn = await fp.listFavorite('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('FavoriteApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = FavoriteApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.createFavorite({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token', createFavoriteRequest: { path: 'test.txt' } as any,
      })).resolves.toBeDefined();

      await expect(factory.deleteFavorite({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token', cancel: DeleteFavoriteCancelEnum.NUMBER_1, deleteFavoriteRequest: { path: 'test.txt' } as any,
      })).resolves.toBeDefined();

      await expect(factory.listFavorite({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();
    });
  });
});

// ─── SearchApi ───────────────────────────────────────────

import {
  SearchApiFp,
  SearchApiFactory,
} from '../../apis/search-api';

describe('SearchApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('SearchApiFp', () => {
    const fp = SearchApiFp();

    it('searchFs', async () => {
      const fn = await fp.searchFs('lib-1', 'space-1', 'token', { keyword: 'test' } as any);
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('SearchApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = SearchApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.searchFs({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token', searchFsRequest: { keyword: 'test' } as any,
      })).resolves.toBeDefined();
    });
  });
});

// ─── RecentApi ───────────────────────────────────────────

import {
  RecentApiFp,
  RecentApiFactory,
} from '../../apis/recent-api';

describe('RecentApi Factory/Fp 层覆盖', () => {
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    mockAxios = createMockAxios();
  });

  describe('RecentApiFp', () => {
    const fp = RecentApiFp();

    it('listRecentlyUsedFile', async () => {
      const fn = await fp.listRecentlyUsedFile('lib-1', 'space-1', 'token');
      expect(await fn(mockAxios, MOCK_BASE)).toBeDefined();
    });
  });

  describe('RecentApiFactory', () => {
    it('所有方法应可调用', async () => {
      const factory = RecentApiFactory(undefined, MOCK_BASE, mockAxios);

      await expect(factory.listRecentlyUsedFile({
        libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token',
      })).resolves.toBeDefined();
    });
  });
});
