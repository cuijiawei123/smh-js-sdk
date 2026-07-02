/**
 * Uploader - 文件上传器
 * 支持简单上传、分片上传、秒传检测、断点续传
 * 浏览器环境适配版本
 */

import axios, { AxiosInstance } from 'axios';
import { FileApi } from '../apis/file-api';
import { DirectoryApi } from '../apis/directory-api';
import { Configuration } from '../configuration';
import { formatSize, formatTime } from '../utils/Formatter';
import { parseCOSDomain, parallelLimit } from '../utils/index';
import { calculateBeginningHash, calculateFullHash } from '../utils/hash';
import { 
  updateCRC64, 
  finalizeCRC64, 
  combinePartsCRC64, 
  CRC64_INIT_VALUE,
  calculateBlobCRC64
} from '../utils/crc64';
import { SMHError, ErrorCode, newError, analyzeError, wrapErrorToSMHError, extractAxiosErrorInfo, ServerErrorCode } from '../utils/ErrorHandler';
import { CommonLoader } from './CommonLoader';
import { 
  TaskStatus, 
  IFile,
  IUpPartInfo,
  UploadCheckpoint,
  UploadOptions 
} from './types';

/**
 * Uploader类 - 文件上传器
 * 支持秒传、简单上传、分块上传、断点续传
 */
export class Uploader extends CommonLoader<UploadCheckpoint> {
  
  // 上传选项
  private options: UploadOptions;
  
  // Checkpoint信息
  private upload_id?: string;
  private confirm_key?: string;
  private bucket?: string;
  private region?: string;
  private key?: string;
  private chunk_size: number;
  private part_info_list: IUpPartInfo[] = [];
  private rapid_upload: boolean = false;
  private crc64?: string;
  
  private fileApi: FileApi;
  private directoryApi: DirectoryApi;

  // autoCreateDir：标记是否已经尝试过"自动创建目录后重试"，防止死循环
  private autoCreateDirAttempted: boolean = false;
  
  // 续期定时器
  private renewTimer?: ReturnType<typeof setTimeout>;
  
  // 常量
  private CHUNK_FILE_SIZE: number;              // 分片上传阈值
  private readonly MIN_SIZE_FOR_HASH: number;   // 秒传最小文件大小
  private readonly DEFAULT_PARALLEL: number = 2; // 浏览器默认并发数
  
  constructor(
    options: UploadOptions,
    configuration: Configuration,
    axiosInstance?: AxiosInstance
  ) {
    const file: IFile = {
      name: options.file.name,
      size: options.file.size,
      type: options.file.type
    };
    
    // 验证文件
    if (!options.file || !options.file.name || isNaN(options.file.size)) {
      throw newError(
        ErrorCode.INVALID_FILE,
        'Invalid file: file must have name and size',
        undefined,
        { file }
      );
    }
    
    super(file, { verbose: options.verbose });
    
    this.options = options;
    // 透传 axiosInstance，确保 FileApi 复用 SMHClient 配置好的 axios 实例
    // （包含 Client-Version 等默认请求头、重试拦截器等）
    this.fileApi = new FileApi(configuration, undefined, axiosInstance);
    this.directoryApi = new DirectoryApi(configuration, undefined, axiosInstance);
    
    const partFileSize = options.partFileSize || 32;
    const MIN_PART_FILE_SIZE = 1;
    const MAX_PART_FILE_SIZE = 5 * 1024;
    
    if (partFileSize < MIN_PART_FILE_SIZE || partFileSize > MAX_PART_FILE_SIZE) {
      throw newError(
        ErrorCode.INVALID_PARAMETER,
        `partFileSize must be between ${MIN_PART_FILE_SIZE}MB and ${MAX_PART_FILE_SIZE}MB`,
        undefined,
        { partFileSize }
      );
    }
    
    this.CHUNK_FILE_SIZE = partFileSize * 1024 * 1024;
    this.MIN_SIZE_FOR_HASH = 1 * 1024 * 1024;
    this.chunk_size = (options.chunkSize || 5) * 1024 * 1024;
    
    // 恢复checkpoint
    if (options.checkpoint) {
      this.restoreCheckpoint(options.checkpoint);
    }
  }
  
  protected getTaskType(): string {
    return 'upload';
  }
  
  /**
   * 检查任务是否被停止
   */
  private throwIfStopped(context: string): void {
    if (this.pauseFlag || this.cancelFlag) {
      throw newError(
        this.pauseFlag ? ErrorCode.UPLOAD_PAUSED : ErrorCode.UPLOAD_CANCELED,
        `Upload stopped ${context}`,
        undefined,
        { fileName: this.file.name }
      );
    }
  }
  
  /**
   * 恢复checkpoint
   */
  private restoreCheckpoint(checkpoint: UploadCheckpoint): void {
    this.state = checkpoint.state;
    this.progress = checkpoint.progress;
    this.loaded = checkpoint.loaded;
    this.startSize = checkpoint.loaded;
    this.lastProgressLoaded = checkpoint.loaded;
    this.upload_id = checkpoint.upload_id;
    this.confirm_key = checkpoint.confirm_key;
    this.bucket = checkpoint.bucket;
    this.region = checkpoint.region;
    this.key = checkpoint.key;
    this.chunk_size = checkpoint.chunk_size;
    this.part_info_list = checkpoint.part_info_list || [];
    this.rapid_upload = checkpoint.rapid_upload || false;
    this.crc64 = checkpoint.crc64;
    this.start_time = checkpoint.start_time || 0;
    this.end_time = checkpoint.end_time || 0;
    this.used_avg_speed = checkpoint.used_avg_speed || 0;
    this.used_time_len = checkpoint.used_time_len || 0;
  }
  
  /**
   * 获取checkpoint信息
   */
  getCheckpoint(): UploadCheckpoint {
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
      upload_id: this.upload_id,
      confirm_key: this.confirm_key,
      bucket: this.bucket,
      region: this.region,
      key: this.key,
      chunk_size: this.chunk_size,
      part_info_list: this.part_info_list.map(p => ({
        part_number: p.part_number,
        chunk_size: p.chunk_size,
        etag: p.etag,
        crc64: p.crc64,
        from: p.from,
        to: p.to,
        start_time: p.start_time,
        end_time: p.end_time
      })),
      crc64: this.crc64,
      rapid_upload: this.rapid_upload,
      start_time: this.start_time,
      end_time: this.end_time,
      used_avg_speed: this.used_avg_speed,
      used_time_len: this.used_time_len
    };
  }
  
  /**
   * 开始任务
   */
  async start(): Promise<void> {
    if (!['waiting', 'error', 'paused', 'canceled'].includes(this.state)) {
      return;
    }
    
    await this.changeState(TaskStatus.START);
    await this.doStart();
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
      
      // axios 取消错误，忽略
      if (axios.isCancel(error)) {
        return;
      }

      await this.handleError(error as Error);
    }
  }
  
  /**
   * 暂停任务
   */
  async pause(): Promise<void> {
    this.pauseFlag = true;
    
    // 清除续期定时器
    this.clearRenewalTimer();
    
    this.logInfo(`Task paused: ${this.file.name}, progress: ${this.progress.toFixed(2)}%`);
    
    await super.pause();
  }
  
  /**
   * 取消任务
   */
  async cancel(): Promise<void> {
    if (this.cancelFlag) {
      return;
    }

    // 清除续期定时器
    this.clearRenewalTimer();

    // 取消时通知服务器清理资源
    if (this.confirm_key) {
      try {
        await this.fileApi.abortFileUpload({
          libraryId: this.options.libraryId,
          spaceId: this.options.spaceId,
          confirmKey: this.confirm_key,
          upload: 1,
          accessToken: this.options.accessToken,
          userId: this.options.userId
        });
      } catch (error) {
        // 忽略取消错误
      }
      
      this.confirm_key = undefined;
      this.upload_id = undefined;
    }
    
    this.logInfo(`Task canceled: ${this.file.name}`);
    
    await super.cancel();
  }
  
  /**
   * 主运行流程
   */
  private async run(): Promise<void> {
    if (!this.start_time) {
      this.start_time = Date.now();
    }
    
    // 上次暂停前已秒传成功
    if (this.rapid_upload) {
      this.end_time = Date.now();
      return await this.changeState(TaskStatus.SUCCESS);
    }
    
    // 执行上传
    await this.executeUpload();
    
    // 秒传成功时已在 executeMultipartUpload/executeSimpleUpload 中处理完毕，直接返回
    if (this.rapid_upload) {
      this.end_time = Date.now();
      return;
    }
    
    // 上传完成
    this.end_time = Date.now();
    await this.changeState(TaskStatus.SUCCESS);
    
    const elapsed = this.end_time - this.start_time;
    this.logInfo(`Upload success: ${this.file.name}, size: ${formatSize(this.file.size)}, time: ${formatTime(elapsed)}, speed: ${formatSize(this.used_avg_speed || 0)}/s`);
  }
  
  /**
   * 执行上传流程
   */
  /**
   * 执行上传流程
   *
   * 外层包装：当开启 autoCreateDir 且上传因目标父目录不存在（DirectoryNotFound）
   * 失败时，自动创建所需父目录后重试一次。
   */
  private async executeUpload(): Promise<void> {
    try {
      await this.dispatchUpload();
    } catch (error) {
      // 仅在以下条件全部满足时才尝试自动创建目录并重试：
      // 1. 开启了 autoCreateDir
      // 2. 尚未尝试过（防止死循环）
      // 3. 未处于暂停/取消状态
      // 4. 错误确实是目标父目录不存在（serverCode === DirectoryNotFound）
      if (
        !this.options.autoCreateDir ||
        this.autoCreateDirAttempted ||
        this.pauseFlag ||
        this.cancelFlag ||
        !this.isDirectoryNotFoundError(error)
      ) {
        throw error;
      }

      this.autoCreateDirAttempted = true;

      const dirPath = this.getParentDirPath(this.options.filePath);
      // 根目录下的文件没有父目录可建，直接抛出原始错误
      if (!dirPath) {
        throw error;
      }

      this.logWarn(`Upload failed with DirectoryNotFound, auto-creating parent directory: ${dirPath}`);
      await this.ensureDirectory(dirPath);

      this.throwIfStopped('after auto-creating directory');

      // 创建目录后重试一次上传
      await this.dispatchUpload();
    }
  }

  /**
   * 派发上传：根据文件大小选择简单上传或分块上传
   */
  private async dispatchUpload(): Promise<void> {
    const fileSize = this.file.size;
    const threshold = this.CHUNK_FILE_SIZE;
    const enableInstantUpload = this.options.enableInstantUpload !== false;
    
    const useMultipart = fileSize > threshold;
    this.logInfo(`Upload strategy: fileSize=${formatSize(fileSize)}, threshold=${formatSize(threshold)}, useMultipart=${useMultipart}, enableInstantUpload=${enableInstantUpload}`);
    
    let beginningHash: string | undefined;
    if (enableInstantUpload && fileSize >= this.MIN_SIZE_FOR_HASH && !this.confirm_key && !this.rapid_upload) {
      // 计算哈希状态
      await this.changeState(TaskStatus.COMPUTING_HASH);
      beginningHash = await calculateBeginningHash(this.options.file, fileSize);
      
      this.throwIfStopped('during beginning hash calculation');
    }
    
    // 调用上传接口
    if (useMultipart) {
      await this.executeMultipartUpload(beginningHash);
    } else {
      await this.executeSimpleUpload(beginningHash);
    }
  }

  /**
   * 判断错误是否为"目标父目录不存在"（DirectoryNotFound）
   *
   * 上传任务内部直接使用原始 axios 实例（未经过 SmhClient 的 SMHError 包装），
   * 因此这里从 AxiosError 中提取 serverCode 进行判断，避免依赖中文 message。
   */
  private isDirectoryNotFoundError(error: any): boolean {
    if (error instanceof SMHError) {
      return error.response?.serverCode === ServerErrorCode.DirectoryNotFound;
    }
    const { serverCode } = extractAxiosErrorInfo(error);
    return serverCode === ServerErrorCode.DirectoryNotFound;
  }

  /**
   * 提取文件路径的父目录部分。
   * - "a/b/c.txt" -> "a/b"
   * - "c.txt"     -> ""（根目录下的文件，无父目录）
   */
  private getParentDirPath(filePath: string): string {
    const normalized = filePath.replace(/^\/+/, '').replace(/\/+$/, '');
    const idx = normalized.lastIndexOf('/');
    return idx > 0 ? normalized.slice(0, idx) : '';
  }

  /**
   * 确保目录存在。
   *
   * SMH 服务端的 createDirectory 会自动递归创建中间所需的各级父目录，
   * 因此这里只需对完整目录路径调用一次即可。
   *
   * 使用默认的 ask 冲突策略（不可用 rename：rename 会把已存在的目录重命名为
   * "bar (1)" 导致后续上传路径错位）。对"目录已存在"产生的 409 /
   * SameNameDirectoryOrFileExists 视为成功并吞掉——若父级实际是同名文件（真冲突），
   * 后续重试上传仍会报 DirectoryNotFound，届时由外层抛出原始错误。
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await this.directoryApi.createDirectory({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        filePath: dirPath,
        accessToken: this.options.accessToken,
        userId: this.options.userId,
      });
    } catch (error) {
      const { serverCode, status } = extractAxiosErrorInfo(error);
      // 目录已存在（ask 策略下冲突返回 409 SameNameDirectoryOrFileExists）：视为成功
      if (
        serverCode === ServerErrorCode.SameNameDirectoryOrFileExists ||
        status === 409
      ) {
        this.logInfo(`Directory already exists, skip: ${dirPath}`);
        return;
      }
      // 其它错误（如 DirectoryLevelExceed / DirectoryNotAllowed / 权限不足）原样抛出
      throw newError(
        ErrorCode.UPLOAD_FAILED,
        `Failed to auto-create directory: ${dirPath}`,
        error as Error,
        { fileName: this.file.name, dirPath }
      );
    }
  }
  
  /**
   * 执行简单上传
   */
  private async executeSimpleUpload(beginningHash?: string): Promise<void> {
    const fileMetaFields = this.getFileMetaFields();
    const simpleUploadRequest = beginningHash 
      ? { beginningHash, size: String(this.file.size), ...fileMetaFields } 
      : { ...fileMetaFields };
    
    // 调用上传接口
    await this.changeState(TaskStatus.CREATED);
    let uploadResponse = await this.fileApi.simpleUploadFile({
      libraryId: this.options.libraryId,
      spaceId: this.options.spaceId,
      filePath: this.options.filePath,
      filesize: this.file.size,
      accessToken: this.options.accessToken,
      userId: this.options.userId,
      trafficLimit: this.options.trafficLimit,
      simpleUploadFileRequest: simpleUploadRequest,
      ...(this.options.conflictResolutionStrategy && { 
        conflictResolutionStrategy: this.options.conflictResolutionStrategy 
      }),
      ...(this.options.internalDomain != null && {
        internalDomain: this.options.internalDomain
      })
    });
    
    let httpStatus = uploadResponse.status;
    
    // 检查是否需要计算 fullHash
    if (httpStatus === 202) {
      await this.changeState(TaskStatus.COMPUTING_HASH);
      const fullHash = await calculateFullHash(this.options.file, this.file.size, (progress) => {
        this.notifyProgress('computing_hash', progress);
      });
      
      this.throwIfStopped('during hash calculation');
      
      uploadResponse = await this.fileApi.simpleUploadFile({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        filePath: this.options.filePath,
        filesize: this.file.size,
        accessToken: this.options.accessToken,
        userId: this.options.userId,
        trafficLimit: this.options.trafficLimit,
        simpleUploadFileRequest: {
          fullHash: fullHash,
          beginningHash: beginningHash,
          size: String(this.file.size),
          ...fileMetaFields
        },
        ...(this.options.conflictResolutionStrategy && { 
          conflictResolutionStrategy: this.options.conflictResolutionStrategy 
        }),
        ...(this.options.internalDomain != null && {
          internalDomain: this.options.internalDomain
        })
      });
      
      httpStatus = uploadResponse.status;
      
      // 秒传成功
      if (httpStatus === 200) {
        this.rapid_upload = true;
        this.loaded = this.file.size;
        this.progress = 100;
        this.updateProgress(this.file.size, { immediately: true });
        
        if (this.start_time) {
          const elapsedTime = Date.now() - this.start_time;
          this.used_avg_speed = elapsedTime > 0 ? (this.file.size / elapsedTime) * 1000 : 0;
          this.speed = this.used_avg_speed;
        }
        
        await this.changeState(TaskStatus.RAPID_SUCCESS);
        this.logInfo(`Rapid upload success: ${this.file.name}`);
        return;
      }
    }
    
    const uploadData = uploadResponse.data as any;
    
    const { bucket, region } = parseCOSDomain(uploadData.domain);
    this.confirm_key = uploadData.confirmKey;
    this.bucket = bucket;
    this.region = region;
    this.key = uploadData.path?.replace(/^\//, '') || '';
    
    // 开始上传
    await this.changeState(TaskStatus.RUNNING);
    this.task_start_time = Date.now();
    this.startCalcSpeed();
    
    await this.simpleUploadWithRetry(uploadData);
    
    this.pauseCalcSpeed();
    this.calcTotalAvgSpeed();
    
    this.throwIfStopped('after upload completion');
    
    await this.changeState(TaskStatus.CONFIRMING);
    await this.confirmUpload();
  }
  
  /**
   * 带重试的简单上传
   */
  private async simpleUploadWithRetry(uploadData: any, retryCount: number = 0): Promise<void> {
    try {
      await this.simpleUpload(uploadData);
    } catch (error) {
      if (this.pauseFlag || this.cancelFlag) {
        throw error;
      }
      
      const { isExpired } = analyzeError(error);
      
      if (retryCount < this.MAX_RETRY_TIMES) {
        this.loaded = 0;
        this.startSize = 0;
        this.lastProgressLoaded = 0;
        this.updateProgress(0, { immediately: true });
        
        if (isExpired) {
          // 重新获取签名
          const uploadResponse = await this.fileApi.simpleUploadFile({
            libraryId: this.options.libraryId,
            spaceId: this.options.spaceId,
            filePath: this.options.filePath,
            filesize: this.file.size,
            accessToken: this.options.accessToken,
            userId: this.options.userId,
            trafficLimit: this.options.trafficLimit,
            simpleUploadFileRequest: { ...this.getFileMetaFields() },
            ...(this.options.conflictResolutionStrategy && { 
              conflictResolutionStrategy: this.options.conflictResolutionStrategy 
            }),
            ...(this.options.internalDomain != null && {
              internalDomain: this.options.internalDomain
            })
          });
          
          const newUploadData = uploadResponse.data as any;
          const { bucket, region } = parseCOSDomain(newUploadData.domain);
          this.bucket = bucket;
          this.region = region;
          this.key = newUploadData.path?.replace(/^\//, '') || '';
          
          return this.simpleUploadWithRetry(newUploadData, retryCount + 1);
        } else {
          this.logWarn(`Simple upload retry ${retryCount + 1}/${this.MAX_RETRY_TIMES}: ${(error as Error)?.message || error}`);
          return this.simpleUploadWithRetry(uploadData, retryCount + 1);
        }
      } else {
        throw newError(
          ErrorCode.UPLOAD_FAILED,
          'Simple upload failed after retries',
          error as Error,
          { fileName: this.file.name, fileSize: this.file.size, retryCount }
        );
      }
    }
  }
  
  /**
   * 简单上传（使用 axios）
   */
  private async simpleUpload(uploadData: any): Promise<void> {
    const headers = uploadData.headers || {};
    const protocol = this.options.protocol || 'https:';
    const url = `${protocol}//${uploadData.domain}${uploadData.path || ''}`;
    
    this.updateProgress(0, { immediately: true });
    
    // 计算 CRC64
    this.crc64 = await calculateBlobCRC64(this.options.file);
    
    const fileData = await this.toUploadData(this.options.file);

    await axios.put(url, fileData, {
      headers: {
        ...headers,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: Math.max(5 * 60 * 1000, Math.ceil(this.file.size / (100 * 1024)) * 1000),
      signal: this.abortSignal,
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.loaded) {
          this.updateProgress(progressEvent.loaded);
        }
      }
    });
    this.updateProgress(this.file.size, { immediately: true });
  }
  
  /**
   * 执行分块上传
   */
  private async executeMultipartUpload(beginningHash?: string): Promise<void> {
    if (!this.part_info_list || this.part_info_list.length === 0) {
      this.initChunks();
    }
    
    let uploadData: any;
    
    if (this.upload_id && this.confirm_key) {
      // 断点续传场景，先续期
      const renewData = await this.renewUploadTask();
      
      uploadData = {
        domain: renewData.domain,
        path: renewData.path || `/${this.key}`,
        uploadId: this.upload_id,
        confirmKey: this.confirm_key,
        expiration: renewData.expiration,
        headers: renewData.headers
      };
    } else {
      const fileMetaFields = this.getFileMetaFields();
      const multipartUploadRequest = beginningHash
        ? { beginningHash, size: String(this.file.size), ...fileMetaFields } 
        : { ...fileMetaFields };
      
      await this.changeState(TaskStatus.CREATED);
      let uploadResponse = await this.fileApi.multipartUploadFile({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        filePath: this.options.filePath,
        multipart: 1,
        filesize: this.file.size,
        accessToken: this.options.accessToken,
        userId: this.options.userId,
        trafficLimit: this.options.trafficLimit,
        multipartUploadFileRequest: multipartUploadRequest,
        ...(this.options.conflictResolutionStrategy && { 
          conflictResolutionStrategy: this.options.conflictResolutionStrategy 
        }),
        ...(this.options.internalDomain != null && {
          internalDomain: this.options.internalDomain
        })
      });
      
      let httpStatus = uploadResponse.status;
      
      // 检查是否需要 fullHash
      if (httpStatus === 202) {
        await this.changeState(TaskStatus.COMPUTING_HASH);
        const fullHash = await calculateFullHash(this.options.file, this.file.size, (progress) => {
          this.notifyProgress('computing_hash', progress);
        });
        
        this.throwIfStopped('during full hash calculation');
        
        uploadResponse = await this.fileApi.multipartUploadFile({
          libraryId: this.options.libraryId,
          spaceId: this.options.spaceId,
          filePath: this.options.filePath,
          multipart: 1,
          filesize: this.file.size,
          accessToken: this.options.accessToken,
          userId: this.options.userId,
          trafficLimit: this.options.trafficLimit,
          multipartUploadFileRequest: {
            fullHash: fullHash,
            beginningHash: beginningHash,
            size: String(this.file.size),
            ...fileMetaFields
          },
          ...(this.options.conflictResolutionStrategy && { 
            conflictResolutionStrategy: this.options.conflictResolutionStrategy 
          }),
          ...(this.options.internalDomain != null && {
            internalDomain: this.options.internalDomain
          })
        });
        
        httpStatus = uploadResponse.status;
        
        // 秒传成功
        if (httpStatus === 200) {
          this.rapid_upload = true;
          this.loaded = this.file.size;
          this.progress = 100;
          this.updateProgress(this.file.size, { immediately: true });
          
          if (this.start_time) {
            const elapsedTime = Date.now() - this.start_time;
            this.used_avg_speed = elapsedTime > 0 ? (this.file.size / elapsedTime) * 1000 : 0;
            this.speed = this.used_avg_speed;
          }
          
          await this.changeState(TaskStatus.RAPID_SUCCESS);
          this.logInfo(`Rapid upload success: ${this.file.name}`);
          return;
        }
      }
      
      uploadData = uploadResponse.data;
      
      const { bucket, region } = parseCOSDomain(uploadData.domain);
      this.confirm_key = uploadData.confirmKey;
      this.upload_id = uploadData.uploadId;
      this.bucket = bucket;
      this.region = region;
      this.key = uploadData.path?.replace(/^\//, '') || '';
      
      if (uploadData.expiration) {
        this.scheduleRenewal(uploadData.expiration);
      }
    }
    
    // 开始上传
    await this.changeState(TaskStatus.RUNNING);
    this.task_start_time = Date.now();
    this.startCalcSpeed();
    
    await this.multipartUpload(uploadData);
    
    this.pauseCalcSpeed();
    this.calcTotalAvgSpeed();
    
    // 计算 CRC64
    if (!this.crc64) {
      await this.changeState(TaskStatus.COMPUTING_HASH);
      this.crc64 = await this.calculateMultipartCRC64();
      
      this.throwIfStopped('after CRC64 calculation');
    }
    
    // 确认上传
    await this.changeState(TaskStatus.CONFIRMING);
    await this.confirmUpload();
  }
  
  /**
   * 上传单个分片
   */
  private async uploadSinglePart(
    part: IUpPartInfo,
    uploadData: any,
    headers: { [key: string]: string },
    partRetryCount: number = 0
  ): Promise<void> {
    this.throwIfStopped('during part upload');
    
    if (part.etag) {
      return;
    }

    part.start_time = Date.now();

    const protocol = this.options.protocol || 'https:';
    const partUrl = `${protocol}//${uploadData.domain}${uploadData.path || ''}?partNumber=${part.part_number}&uploadId=${this.upload_id}`;
    
    // 获取分片 Blob
    const partBlob = this.options.file.slice(part.from, part.to);

    const partData = await this.toUploadData(partBlob);

    try {
      const response = await axios.put(partUrl, partData, {
        headers: {
          ...headers,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: Math.max(5 * 60 * 1000, Math.ceil(part.chunk_size / (100 * 1024)) * 1000),
        signal: this.abortSignal,
      });

      part.etag = response.headers['etag'] || response.headers['ETag'] || '';
      part.end_time = Date.now();

      // 计算分片 CRC64
      if (!part.crc64) {
        part.crc64 = await calculateBlobCRC64(partBlob);
      }

      // 分片完成后才更新全局进度，避免暂停时进度倒退
      this.loaded += part.chunk_size;
      this.updateProgress(this.loaded, { immediately: true });

      this.notifyPartCompleted(part);
      
      this.logInfo(`Part ${part.part_number}/${this.part_info_list.length} uploaded, size: ${formatSize(part.chunk_size)}`);
    } catch (error) {
      if (this.pauseFlag || this.cancelFlag) {
        throw error;
      }
      
      if (axios.isCancel(error)) {
        throw error;
      }

      if (partRetryCount < this.MAX_RETRY_TIMES) {
        this.logWarn(`Part ${part.part_number} upload retry ${partRetryCount + 1}/${this.MAX_RETRY_TIMES}`);
        
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, partRetryCount), 10000)));
        
        return this.uploadSinglePart(part, uploadData, headers, partRetryCount + 1);
      }

      throw error;
    }
  }

  /**
   * 分块上传
   */
  private async multipartUpload(uploadData: any, retryCount: number = 0): Promise<void> {
    const headers = uploadData.headers || {};
    const parallel = this.options.parallel || this.DEFAULT_PARALLEL;
    
    // 计算已完成的分片大小
    let finishedSize = 0;
    if (this.part_info_list && this.part_info_list.length > 0) {
      this.part_info_list.forEach(part => {
        if (part.etag) {
          finishedSize += part.chunk_size;
        }
      });
    }
    
    this.loaded = finishedSize;
    
    if (finishedSize > 0) {
      this.updateProgress(finishedSize, { immediately: true, init: true });
    } else {
      this.updateProgress(0, { immediately: true });
    }
    
    try {
      const pendingParts = this.part_info_list.filter(part => !part.etag);
      
      await parallelLimit(
        pendingParts,
        parallel,
        async (part) => {
          await this.uploadSinglePart(part, uploadData, headers);
        },
        { shouldStop: () => this.pauseFlag || this.cancelFlag }
      );
      
      this.updateProgress(this.file.size, { immediately: true });
    } catch (error) {
      if (this.pauseFlag || this.cancelFlag) {
        throw error;
      }
      
      const { isExpired } = analyzeError(error);
      
      if (isExpired && retryCount < this.MAX_RETRY_TIMES) {
        try {
          const newUploadData = await this.renewUploadTask();
          this.logWarn(`Multipart upload retry ${retryCount + 1}/${this.MAX_RETRY_TIMES}: signature expired`);
          return this.multipartUpload({
            ...newUploadData,
            headers: newUploadData.headers
          }, retryCount + 1);
        } catch (renewError) {
          throw newError(
            ErrorCode.RENEW_UPLOAD_FAILED,
            'Failed to renew multipart upload',
            renewError as Error,
            { fileName: this.file.name, confirmKey: this.confirm_key }
          );
        }
      } else {
        throw newError(
          ErrorCode.PART_UPLOAD_FAILED,
          'Multipart upload failed after retries',
          error as Error,
          { fileName: this.file.name, fileSize: this.file.size, retryCount }
        );
      }
    }
  }
  
  /**
   * 动态计算分块大小
   */
  private calcAutoChunkSize(fileSize: number, chunkSize: number): number {
    const SIZE = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 1024 * 2, 1024 * 4, 1024 * 5];
    const MAX_PART_COUNT = 10000;
    
    let autoChunkSize = 1024 * 1024;
    
    for (let i = 0; i < SIZE.length; i++) {
      autoChunkSize = SIZE[i] * 1024 * 1024;
      if (fileSize / autoChunkSize <= MAX_PART_COUNT) {
        break;
      }
    }
    
    return Math.max(chunkSize, autoChunkSize);
  }
  
  /**
   * 初始化分片信息
   */
  private initChunks(): void {
    const fileSize = this.file.size;
    
    const MAX_PART_COUNT = 10000;
    const MIN_CHUNK_SIZE = 1 * 1024 * 1024;
    const MAX_CHUNK_SIZE = 5 * 1024 * 1024 * 1024;
    const MAX_FILE_SIZE = MAX_CHUNK_SIZE * MAX_PART_COUNT;
    
    if (fileSize > MAX_FILE_SIZE) {
      throw newError(
        ErrorCode.FILE_TOO_LARGE,
        `File size ${formatSize(fileSize)} exceeds maximum supported size ${formatSize(MAX_FILE_SIZE)}`,
        undefined,
        { fileSize, maxFileSize: MAX_FILE_SIZE }
      );
    }
    
    let chunkSize = this.calcAutoChunkSize(fileSize, this.chunk_size);
    
    if (chunkSize < MIN_CHUNK_SIZE) {
      chunkSize = MIN_CHUNK_SIZE;
    }
    
    if (chunkSize > MAX_CHUNK_SIZE) {
      throw newError(
        ErrorCode.INVALID_PARAMETER,
        `Required chunk size ${formatSize(chunkSize)} exceeds maximum chunk size ${formatSize(MAX_CHUNK_SIZE)}`,
        undefined,
        { chunkSize, maxChunkSize: MAX_CHUNK_SIZE }
      );
    }
    
    let partCount = Math.ceil(fileSize / chunkSize);
    
    if (partCount > MAX_PART_COUNT) {
      throw newError(
        ErrorCode.INVALID_PARAMETER,
        `File size ${formatSize(fileSize)} requires ${partCount} parts, exceeds maximum ${MAX_PART_COUNT} parts`,
        undefined,
        { fileSize, partCount, maxPartCount: MAX_PART_COUNT }
      );
    }
    
    this.chunk_size = chunkSize;
    
    this.part_info_list = [];
    for (let i = 0; i < partCount; i++) {
      const from = i * chunkSize;
      const to = Math.min((i + 1) * chunkSize, fileSize);
      this.part_info_list.push({
        part_number: i + 1,
        chunk_size: to - from,
        from,
        to
      });
    }
  }

  /**
   * 计算分块上传的 CRC64
   */
  private async calculateMultipartCRC64(): Promise<string> {
    if (!this.part_info_list || this.part_info_list.length === 0) {
      throw newError(
        ErrorCode.OPERATION_FAILED,
        'No part info available for CRC64 calculation',
        undefined,
        { fileName: this.file.name }
      );
    }
    
    // 确保所有分块都有 CRC64
    for (const part of this.part_info_list) {
      if (!part.crc64) {
        const partBlob = this.options.file.slice(part.from, part.to);
        part.crc64 = await calculateBlobCRC64(partBlob);
      }
    }
    
    // 组合所有分块的 CRC64
    return combinePartsCRC64(
      this.part_info_list.map(p => ({ crc64: p.crc64!, size: p.chunk_size }))
    );
  }
  
  /**
   * 确认上传
   */
  private async confirmUpload(): Promise<void> {
    await this.fileApi.completeFileUpload({
      libraryId: this.options.libraryId,
      spaceId: this.options.spaceId,
      confirmKey: this.confirm_key!,
      confirm: 1,
      accessToken: this.options.accessToken,
      userId: this.options.userId,
      completeFileUploadRequest: {
        crc64: this.crc64,
        ...this.getFileMetaFields()
      },
      ...(this.options.conflictResolutionStrategy && { 
        conflictResolutionStrategy: this.options.conflictResolutionStrategy 
      })
    });
  }
  
  /**
   * 续期上传任务
   */
  private async renewUploadTask(): Promise<any> {
    if (!this.confirm_key) {
      throw newError(
        ErrorCode.RENEW_UPLOAD_FAILED,
        'Cannot renew upload task: confirm_key is missing',
        undefined,
        { fileName: this.file.name }
      );
    }
    
    try {
      const response = await this.fileApi.renewMultipartUpload({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        confirmKey: this.confirm_key,
        renew: 1,
        trafficLimit: this.options.trafficLimit,
        accessToken: this.options.accessToken,
        userId: this.options.userId,
        ...(this.options.internalDomain != null && {
          internalDomain: this.options.internalDomain
        })
      });
      
      const renewData = response.data as any;
      
      if (renewData.domain) {
        const { bucket, region } = parseCOSDomain(renewData.domain);
        this.bucket = bucket;
        this.region = region;
        
        if (renewData.expiration) {
          this.scheduleRenewal(renewData.expiration);
        }
      }
      return renewData;
    } catch (error) {
      const smhError = newError(
        ErrorCode.RENEW_UPLOAD_FAILED,
        'Failed to renew upload task',
        error as Error,
        { confirmKey: this.confirm_key }
      );
      
      await this.handleError(smhError);
      throw smhError;
    }
  }
  
  /**
   * 安排续期定时器
   */
  private scheduleRenewal(expiration: string): void {
    this.clearRenewalTimer();
    
    const expirationTime = new Date(expiration).getTime();
    const now = Date.now();
    const duration = (expirationTime - now) / 1000;
    const renewTime = expirationTime - now - 5 * 60 * 1000;
    
    if (duration < 5 * 60) {
      this.renewUploadTask();
      return;
    }
    
    if (renewTime > 0 && this.state === TaskStatus.RUNNING) {
      this.renewTimer = setTimeout(() => {
        this.renewUploadTask();
      }, renewTime);
    }
  }
  
  /**
   * 清除续期定时器
   */
  private clearRenewalTimer(): void {
    if (this.renewTimer) {
      clearTimeout(this.renewTimer);
      this.renewTimer = undefined;
    }
  }

  private getFileMetaFields(): Record<string, any> {
    const meta: Record<string, any> = {};
    if (this.options.labels) meta.labels = this.options.labels;
    if (this.options.category) meta.category = this.options.category;
    if (this.options.localCreationTime) meta.localCreationTime = this.options.localCreationTime;
    if (this.options.localModificationTime) meta.localModificationTime = this.options.localModificationTime;
    return meta;
  }

  private async toUploadData(data: any): Promise<any> {
    if (data == null) return data;

    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) return data;
    if (typeof data.pipe === 'function') return data;
    if (data instanceof ArrayBuffer) return data;
    if (typeof Uint8Array !== 'undefined' && data instanceof Uint8Array) return data;

    if (this.isNativeBlob(data)) return data;

    if (typeof data.arrayBuffer === 'function' && typeof data.size === 'number') {
      const ab = await data.arrayBuffer();
      return typeof Buffer !== 'undefined' ? Buffer.from(ab) : ab;
    }

    return data;
  }

  private isNativeBlob(value: any): boolean {
    const tag = value?.[Symbol.toStringTag];
    if (tag === 'Blob' || tag === 'File') return true;

    if (typeof Blob !== 'undefined' && value instanceof Blob) return true;

    return false;
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
  private notifyPartCompleted(partInfo: IUpPartInfo): void {
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
      ErrorCode.UPLOAD_FAILED,
      'Upload failed',
      {
        fileName: this.file.name,
        fileSize: this.file.size,
        elapsedTime: (this.end_time || Date.now()) - this.start_time,
      }
    );
    
    this.logError(`Upload failed: ${this.file.name}, error: ${smhError.message}`);
    
    return super.handleError(smhError);
  }
}
