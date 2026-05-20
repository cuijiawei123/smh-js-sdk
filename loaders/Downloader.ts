/**
 * Downloader - 文件下载器
 * 支持简单下载、分片下载、断点续传、CRC64 校验
 * 浏览器环境适配版本
 */

import { FileApi, FileApiInfoFileRequest } from '../apis/file-api';
import { Configuration } from '../configuration';
import type { AxiosInstance } from 'axios';
import { formatSize, formatTime } from '../utils/Formatter';
import { parallelLimit } from '../utils/index';
import { 
  updateCRC64, 
  finalizeCRC64, 
  combinePartsCRC64, 
  CRC64_INIT_VALUE 
} from '../utils/crc64';
import { SMHError, ErrorCode, newError, analyzeError, wrapErrorToSMHError } from '../utils/ErrorHandler';
import { CommonLoader } from './CommonLoader';
import { 
  TaskStatus, 
  IFile,
  IDownPartInfo,
  DownloadCheckpoint,
  DownloadOptions,
  UrlDownloadOptions
} from './types';

/**
 * 远端文件信息接口
 */
export interface IRemoteFile {
  name: string;
  size?: number;
  path: string;
  type?: string;
}

/**
 * Downloader - 文件下载器
 * 支持简单下载、分片下载、断点续传
 */
export class Downloader extends CommonLoader<DownloadCheckpoint> {

  /**
   * 通过浏览器 URL 方式下载文件（推荐用于 Web 端）
   * 获取 cosUrl 后通过 <a> 标签触发浏览器原生下载，
   * 不会将文件内容加载到内存中，适合任意大小的文件。
   * 
   * @param options - URL 下载选项
   * @param configuration - SDK 配置
   * 
   */
  static async downloadByUrl(
    options: UrlDownloadOptions,
    configuration: Configuration,
    axiosInstance?: AxiosInstance
  ): Promise<void> {
    const fileApi = new FileApi(configuration, undefined, axiosInstance);

    const res = await fileApi.infoFile({
      libraryId: options.libraryId,
      spaceId: options.spaceId,
      filePath: options.filePath,
      info: 1,
      contentDisposition: 'attachment',
      accessToken: options.accessToken,
      userId: options.userId,
      trafficLimit: options.trafficLimit,
      historyId: options.historyId,
      internalDomain: options.internalDomain,
      purpose: 'download'
    } as FileApiInfoFileRequest);

    const data = res.data as any;
    const cosUrl = data?.cosUrl;

    if (!cosUrl) {
      throw newError(
        ErrorCode.OPERATION_FAILED,
        'Failed to get download URL: cosUrl not found in response',
        undefined,
        { filePath: options.filePath }
      );
    }

    const fileName = options.fileName || options.filePath.split('/').pop() || 'download';

    const a = document.createElement('a');
    a.href = cosUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // 选项与API
  private options: DownloadOptions;
  private fileApi: FileApi;

  // 分片参数
  private readonly MULTIPART_THRESHOLD: number;
  private chunk_size: number;
  private part_info_list: IDownPartInfo[] = [];
  private is_multipart = false;

  // 下载URL
  private download_url?: string;

  // 远程文件 CRC64
  private remote_crc64?: string;

  // 本地计算的 CRC64
  private local_crc64: bigint = CRC64_INIT_VALUE;

  // 下载结果 Blob
  private resultBlob?: Blob;

  // 浏览器默认并发数
  private readonly DEFAULT_PARALLEL: number = 2;

  constructor(
    file: IRemoteFile, 
    options: DownloadOptions, 
    configuration: Configuration,
    axiosInstance?: AxiosInstance
  ) {
    if (!file || !file.path) {
      throw newError(
        ErrorCode.INVALID_PARAMETER,
        'Invalid remote file: file and file.path are required',
        undefined,
        { file }
      );
    }

    const iFile: IFile = {
      name: file.name,
      size: file.size || 0,
      type: file.type
    };

    super(iFile, { verbose: options.verbose });

    this.options = options;
    // 透传 axiosInstance，使 FileApi 与 SMHClient 共用同一个带 Client-Version 的 axios 实例
    this.fileApi = new FileApi(configuration, undefined, axiosInstance);

    this.MULTIPART_THRESHOLD = (options.partFileSize || 32) * 1024 * 1024;
    this.chunk_size = (options.chunkSize || 5) * 1024 * 1024;

    // 恢复checkpoint
    if (options.checkpoint) {
      this.restoreCheckpoint(options.checkpoint);
    }
  }
  
  protected getTaskType(): string {
    return 'download';
  }

  /**
   * 恢复 checkpoint
   */
  private restoreCheckpoint(checkpoint: DownloadCheckpoint): void {
    this.state = checkpoint.state;
    this.progress = checkpoint.progress;
    this.loaded = checkpoint.loaded;
    this.startSize = checkpoint.loaded;
    this.lastProgressLoaded = checkpoint.loaded;
    this.download_url = checkpoint.download_url;
    this.chunk_size = checkpoint.chunk_size;
    this.part_info_list = checkpoint.part_info_list || [];
    this.remote_crc64 = checkpoint.remote_crc64;
    this.is_multipart = checkpoint.is_multipart || false;
    this.start_time = checkpoint.start_time || 0;
    this.end_time = checkpoint.end_time || 0;
    this.used_avg_speed = checkpoint.used_avg_speed || 0;
    this.used_time_len = checkpoint.used_time_len || 0;
  }

  /**
   * 获取 checkpoint 信息
   */
  getCheckpoint(): DownloadCheckpoint {
    return {
      id: this.id,
      file: {
        name: this.file.name,
        size: this.file.size,
        type: this.file.type
      },
      state: this.state,
      progress: this.progress,
      loaded: this.loaded,
      download_url: this.download_url,
      chunk_size: this.chunk_size,
      part_info_list: this.part_info_list.map(p => ({
        part_number: p.part_number,
        start: p.start,
        end: p.end,
        size: p.size,
        done: p.done,
        crc64: p.crc64
      })),
      remote_crc64: this.remote_crc64,
      is_multipart: this.is_multipart,
      start_time: this.start_time,
      end_time: this.end_time,
      used_avg_speed: this.used_avg_speed,
      used_time_len: this.used_time_len
    };
  }

  /**
   * 开始下载
   * @returns 下载完成后返回 Blob
   */
  async start(): Promise<void> {
    if (!['waiting', 'error', 'paused', 'canceled'].includes(this.state)) {
      return;
    }
    
    await this.changeState(TaskStatus.START);
    await this.doStart();
  }

  /**
   * 开始下载并返回结果
   * @returns 下载完成后返回 Blob
   */
  async startAndGetBlob(): Promise<Blob> {
    if (!['waiting', 'error', 'paused', 'canceled'].includes(this.state)) {
      if (this.resultBlob) {
        return this.resultBlob;
      }
      throw newError(ErrorCode.OPERATION_FAILED, 'Download already in progress');
    }
    
    await this.changeState(TaskStatus.START);
    return await this.doStartAndGetBlob();
  }

  /**
   * 执行开始
   */
  private async doStart(): Promise<void> {
    this.pauseFlag = false;
    this.cancelFlag = false;
    
    try {
      await this.run();
    } catch (error) {
      if (this.pauseFlag || this.cancelFlag) {
        return;
      }
      
      const err = error as Error & { name?: string };
      if (err?.name === 'AbortError') {
        return;
      }
      
      await this.handleError(err);
    }
  }

  /**
   * 执行开始并返回结果
   */
  private async doStartAndGetBlob(): Promise<Blob> {
    this.pauseFlag = false;
    this.cancelFlag = false;
    
    try {
      return await this.run();
    } catch (error) {
      if (this.pauseFlag || this.cancelFlag) {
        throw error;
      }
      
      const err = error as Error & { name?: string };
      if (err?.name === 'AbortError') {
        throw error;
      }
      
      await this.handleError(err);
      throw error;
    }
  }

  /**
   * 暂停下载
   */
  async pause(): Promise<void> {
    // 简单下载暂停时清理数据
    if (!this.is_multipart) {
      this.local_crc64 = CRC64_INIT_VALUE;
    }

    this.logWarn(`Task paused: ${this.file.name}, progress: ${this.progress.toFixed(2)}%`);

    await super.pause();
  }

  /**
   * 取消下载
   */
  async cancel(): Promise<void> {
    // 清理分片数据
    if (this.is_multipart && this.part_info_list && this.part_info_list.length > 0) {
      this.part_info_list.forEach(p => {
        p.blob = undefined;
        p.done = false;
      });
    }
    
    this.loaded = 0;
    this.progress = 0;
    this.resultBlob = undefined;

    this.logWarn(`Task canceled: ${this.file.name}`);

    await super.cancel();
  }

  /**
   * 获取下载结果
   */
  getResult(): Blob | undefined {
    return this.resultBlob;
  }

  /**
   * 主运行流程
   */
  private async run(): Promise<Blob> {
    if (!this.start_time) {
      this.start_time = Date.now();
    }

    await this.getDownloadUrl();
    
    const useMultipart = (this.file.size || 0) > this.MULTIPART_THRESHOLD;
    this.is_multipart = useMultipart;
    
    await this.changeState(TaskStatus.PREPARING);

    if (useMultipart) {
      if (!this.part_info_list || this.part_info_list.length === 0) {
        this.initChunks();
      }
      
      this.updateProgress(this.loaded, { immediately: true, init: true });
      
      await this.changeState(TaskStatus.RUNNING);
      
      this.task_start_time = Date.now();
      this.startCalcSpeed();
      await this.multipartDownload();
      this.pauseCalcSpeed();
      this.calcTotalAvgSpeed();
    } else {
      await this.changeState(TaskStatus.RUNNING);
      this.task_start_time = Date.now();
      this.startCalcSpeed();
      await this.simpleDownloadWithRetry();
      this.pauseCalcSpeed();
      this.calcTotalAvgSpeed();
    }

    // 完成，验证并返回结果
    const blob = await this.finalizeDownload();

    this.end_time = Date.now();
    await this.changeState(TaskStatus.SUCCESS);
    
    const elapsed = this.end_time - this.start_time;
    this.logInfo(`Download success: ${this.file.name}, size: ${formatSize(this.file.size)}, time: ${formatTime(elapsed)}, speed: ${formatSize(this.used_avg_speed || 0)}/s`);

    return blob;
  }

  /**
   * 检查是否被停止
   */
  private throwIfStopped(context: string): void {
    if (this.pauseFlag || this.cancelFlag) {
      throw newError(
        this.pauseFlag ? ErrorCode.DOWNLOAD_PAUSED : ErrorCode.DOWNLOAD_CANCELED,
        `Download stopped ${context}`,
        undefined,
        { fileName: this.file.name }
      );
    }
  }

  /**
   * 获取下载 URL
   */
  private async getDownloadUrl(): Promise<void> {
    try {
      const res = await this.fileApi.infoFile({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        filePath: this.options.filePath,
        info: 1,
        accessToken: this.options.accessToken,
        userId: this.options.userId,
        trafficLimit: this.options.trafficLimit,
        historyId: this.options.historyId,
        internalDomain: this.options.internalDomain,
        purpose: 'download'
      } as FileApiInfoFileRequest);
      
      const data = res.data as any;
      const location = data?.cosUrl;
      
      if (data?.size) {
        this.file.size = Number(data.size);
      }
      
      if (data?.crc64 && !this.remote_crc64) {
        this.remote_crc64 = data.crc64;
      }
      
      this.download_url = location;
    } catch (e) {
      throw e;
    }
  }

  /**
   * 初始化分片列表
   */
  private initChunks(): void {
    const size = this.file.size || 0;
    const chunkSize = this.chunk_size;
    const partCount = Math.ceil(size / chunkSize);
    
    this.part_info_list = [];
    for (let i = 0; i < partCount; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, size) - 1;
      this.part_info_list.push({
        part_number: i + 1,
        start,
        end,
        size: end - start + 1,
        done: false
      });
    }
  }

  /**
   * 带重试的简单下载
   */
  private async simpleDownloadWithRetry(retryCount: number = 0): Promise<void> {
    try {
      await this.simpleDownload();
    } catch (error) {
      if (this.pauseFlag || this.cancelFlag) {
        throw error;
      }
      
      const err = error as Error & { name?: string };
      if (err?.name === 'AbortError') {
        throw error;
      }
      
      const { isExpired } = analyzeError(error);
      
      if (retryCount < this.MAX_RETRY_TIMES) {
        this.logWarn(`Simple download retry ${retryCount + 1}/${this.MAX_RETRY_TIMES}`);
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)));
        
        if (isExpired) {
          await this.getDownloadUrl();
        }
        
        return this.simpleDownloadWithRetry(retryCount + 1);
      }
      
      this.logError(`Simple download failed: ${this.file.name}`);
      throw error;
    }
  }

  /**
   * 简单下载
   */
  private async simpleDownload(): Promise<void> {
    this.updateProgress(0, { immediately: true });
    
    // 初始化 CRC64
    this.local_crc64 = CRC64_INIT_VALUE;

    const response = await fetch(this.download_url!, {
      method: 'GET',
      signal: this.abortSignal
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? Number(contentLength) : this.file.size || 0;
    
    if (total > 0 && this.file.size !== total) {
      this.file.size = total;
      this.updateProgress(0, { immediately: true });
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const chunks: ArrayBuffer[] = [];
    let loaded = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (value) {
          // 转换 Uint8Array 为 ArrayBuffer
          chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer);
          loaded += value.length;
          
          // 更新 CRC64
          this.local_crc64 = updateCRC64(this.local_crc64, value);
          
          this.updateProgress(loaded);
        }
      }
    } finally {
      reader.releaseLock();
    }

    // 请求完成
    // 合并所有数据块
    this.resultBlob = new Blob(chunks, { type: this.file.type || 'application/octet-stream' });
  }

  /**
   * 分片下载
   */
  private async multipartDownload(): Promise<void> {
    const parallel = this.options.parallel || this.DEFAULT_PARALLEL;
    
    // 恢复已完成分片的进度
    let finishedSize = 0;
    this.part_info_list.forEach(part => {
      if (part.done && part.blob) {
        finishedSize += part.size;
      }
    });
    
    this.loaded = finishedSize;
    
    if (finishedSize > 0) {
      this.updateProgress(finishedSize, { immediately: true, init: true });
    } else {
      this.updateProgress(0, { immediately: true });
    }
    
    const runChunk = async (part: IDownPartInfo, retryCount: number = 0): Promise<void> => {
      this.throwIfStopped('during multipart download');
      
      if (part.done && part.blob) return;
      
      try {
        const headers: Record<string, string> = {
          'Range': `bytes=${part.start}-${part.end}`
        };
        
        const response = await fetch(this.download_url!, {
          method: 'GET',
          headers,
          signal: this.abortSignal
        });

        if (!response.ok && response.status !== 206) {
          throw new Error(`Part download failed with status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const chunks: ArrayBuffer[] = [];
        let partCrc64 = CRC64_INIT_VALUE;

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            if (value) {
              chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer);
              partCrc64 = updateCRC64(partCrc64, value);
            }
          }
        } finally {
          reader.releaseLock();
        }

        // 保存分片数据
        part.blob = new Blob(chunks);
        part.crc64 = finalizeCRC64(partCrc64);
        part.done = true;

        // 分片完成后才更新全局进度，避免暂停时进度倒退
        this.loaded += part.size;
        this.updateProgress(this.loaded, { immediately: true });

        this.notifyPartCompleted(part);
        
        this.logInfo(`Part ${part.part_number}/${this.part_info_list.length} downloaded, size: ${formatSize(part.size)}, crc64: ${part.crc64}`);
      } catch (error) {
        if (this.pauseFlag || this.cancelFlag) {
          throw error;
        }
        
        const err = error as Error & { name?: string };
        if (err?.name === 'AbortError') {
          throw error;
        }
        
        const { isExpired } = analyzeError(error);

        if (retryCount < this.MAX_RETRY_TIMES) {
          this.logWarn(`Part ${part.part_number} download retry ${retryCount + 1}/${this.MAX_RETRY_TIMES}`);
          
          if (isExpired) {
            await this.getDownloadUrl();
          }
          
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)));
          return runChunk(part, retryCount + 1);
        }
        
        throw error;
      }
    };

    const pendingParts = this.part_info_list.filter(p => !p.done || !p.blob);
    
    await parallelLimit(
      pendingParts,
      parallel,
      async (part) => {
        await runChunk(part);
      },
      { shouldStop: () => this.pauseFlag || this.cancelFlag }
    );
  }

  /**
   * 完成下载，验证并返回结果
   */
  private async finalizeDownload(): Promise<Blob> {
    // 校验文件大小
    if (this.file.size) {
      const actualSize = this.is_multipart 
        ? this.part_info_list.reduce((sum, p) => sum + (p.blob?.size || 0), 0)
        : this.resultBlob?.size || 0;
        
      if (actualSize !== this.file.size) {
        throw newError(
          ErrorCode.FILE_SIZE_MISMATCH,
          `Download size mismatch: expected ${this.file.size}, got ${actualSize}`,
          undefined,
          { expectedSize: this.file.size, actualSize }
        );
      }
    }
    
    // CRC64 校验
    if (this.remote_crc64) {
      let localCrc64: string;
      
      if (this.is_multipart) {
        // 分片下载：合并各片 CRC64
        localCrc64 = this.combinePartCrc64();
      } else {
        // 简单下载：finalize
        localCrc64 = finalizeCRC64(this.local_crc64);
      }
      
      if (localCrc64 !== this.remote_crc64) {
        throw newError(
          ErrorCode.FILE_CRC64_MISMATCH,
          `Download CRC64 mismatch: expected ${this.remote_crc64}, got ${localCrc64}`
        );
      }
    }
    
    // 合并分片数据
    if (this.is_multipart) {
      const sortedParts = this.part_info_list
        .sort((a, b) => a.part_number - b.part_number);
      
      const blobs = sortedParts.map(p => p.blob!);
      this.resultBlob = new Blob(blobs, { type: this.file.type || 'application/octet-stream' });
      
      // 清理分片 Blob 释放内存
      sortedParts.forEach(p => {
        p.blob = undefined;
      });
    }
    
    return this.resultBlob!;
  }

  /**
   * 合并分片 CRC64
   */
  private combinePartCrc64(): string {
    const sortedParts = this.part_info_list
      .filter(p => p.done && p.crc64)
      .sort((a, b) => a.part_number - b.part_number)
      .map(p => ({ crc64: p.crc64!, size: p.size }));
    
    return combinePartsCRC64(sortedParts);
  }

  /**
   * 改变状态
   */
  protected async changeState(state: TaskStatus, error?: SMHError): Promise<void> {
    await super.changeState(state, error);
    
    const cp = this.getCheckpoint();
    if (typeof this.options.onStateChange === 'function') {
      try {
        await this.options.onStateChange(cp, state, error);
      } catch (err) {
        // 忽略回调错误
      }
    }
  }

  /**
   * 通知进度
   */
  protected notifyProgress(state: string, progress: number): void {
    super.notifyProgress(state, progress);
    
    if (typeof this.options.onProgress === 'function') {
      this.options.onProgress({
        state,
        loaded: this.loaded,
        total: this.file.size,
        progress: progress,
        speed: this.speed,
        leftTime: this.left_time
      });
    }
  }

  /**
   * 通知分片完成
   */
  private notifyPartCompleted(partInfo: IDownPartInfo): void {
    const cp = this.getCheckpoint();
    if (typeof this.options.onPartComplete === 'function') {
      this.options.onPartComplete(cp, partInfo);
    }
    this.emit('partialcomplete', { checkpoint: cp, partInfo });
  }

  /**
   * 处理错误
   */
  protected async handleError(e: Error): Promise<SMHError> {
    const smhError = wrapErrorToSMHError(
      e,
      ErrorCode.DOWNLOAD_FAILED,
      'Download failed',
      {
        fileName: this.file.name,
        fileSize: this.file.size,
        elapsedTime: (this.end_time || Date.now()) - this.start_time,
      }
    );
    
    // 简单下载出错时清理数据
    if (!this.is_multipart) {
      this.resultBlob = undefined;
    }
    
    this.logError(`Download failed: ${this.file.name}, error: ${smhError.message}`);
    return super.handleError(smhError);
  }
}
