/**
 * Loaders 类型定义
 */

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  WAITING = 'waiting',              // 等待开始
  START = 'start',                  // 开始处理
  COMPUTING_HASH = 'computing_hash', // 计算哈希中（上传专用）
  CREATED = 'created',              // 已创建任务（上传专用）
  PREPARING = 'preparing',          // 准备中（下载专用）
  RUNNING = 'running',              // 正在执行
  PAUSED = 'paused',                // 已暂停
  COMPLETE = 'complete',            // 完成，等待确认（上传专用）
  CONFIRMING = 'confirming',        // 确认中（上传专用）
  SUCCESS = 'success',              // 成功
  RAPID_SUCCESS = 'rapid_success',  // 秒传成功（上传专用）
  ERROR = 'error',                  // 失败
  CANCELED = 'canceled'             // 已取消
}

/**
 * 文件信息接口
 */
export interface IFile {
  name: string;
  size: number;
  type?: string;
}

/**
 * 进度信息接口
 */
export interface ProgressInfo {
  loaded: number;       // 已处理字节数
  total: number;        // 总字节数
  progress: number;     // 进度百分比 0-100
  speed: number;        // 速度 bytes/s
  leftTime: number;     // 剩余时间（秒）
}

/**
 * 上传分片信息
 */
export interface IUpPartInfo {
  part_number: number;
  chunk_size: number;
  etag?: string;
  crc64?: string;
  from: number;
  to: number;
  start_time?: number;
  end_time?: number;
}

/**
 * 上传断点信息
 */
export interface UploadCheckpoint {
  id: string;
  file: IFile;
  state: TaskStatus;
  progress: number;
  loaded: number;
  
  // 上传相关
  upload_id?: string;
  confirm_key?: string;
  bucket?: string;
  region?: string;
  key?: string;
  chunk_size: number;
  part_info_list: IUpPartInfo[];
  crc64?: string;
  
  // 时间统计
  start_time?: number;
  end_time?: number;
  used_avg_speed?: number;
  used_time_len?: number;
  
  rapid_upload?: boolean;
  expiration?: string;
}

/**
 * 上传选项接口
 */
export interface UploadOptions {
  libraryId: string;
  spaceId: string;
  filePath: string;                    // 远端路径
  file: File;                          // 浏览器 File 对象
  accessToken: string;
  userId?: string;

  chunkSize?: number;                  // 分块大小，单位MB，默认5MB
  parallel?: number;                   // 并发数，默认2
  partFileSize?: number;               // 分块上传阈值，单位MB，默认32MB
  conflictResolutionStrategy?: 'ask' | 'rename' | 'overwrite';
  
  enableInstantUpload?: boolean;       // 是否启用秒传，默认true
  trafficLimit?: number;               // 单链接限速，范围100KB/s-100MB/s，单位B
  
  // 文件元信息
  labels?: string[];                   // 文件标签列表
  category?: string;                   // 文件自定义的分类
  localCreationTime?: string;          // 文件对应的本地创建时间
  localModificationTime?: string;      // 文件对应的本地修改时间
  
  // 回调函数
  onStateChange?: (checkpoint: UploadCheckpoint, state: TaskStatus, error?: Error) => void;
  onProgress?: (progress: ProgressInfo) => void;
  onPartComplete?: (checkpoint: UploadCheckpoint, partInfo: IUpPartInfo) => void;
  
  // 断点续传
  checkpoint?: UploadCheckpoint;
  
  verbose?: boolean;
}

/**
 * 下载分片信息
 */
export interface IDownPartInfo {
  part_number: number;
  start: number;
  end: number;
  size: number;
  done?: boolean;
  crc64?: string;
  blob?: Blob;           // 浏览器环境存储分片数据
}

/**
 * 下载断点信息
 */
export interface DownloadCheckpoint {
  id: string;
  file: IFile;
  state: TaskStatus;
  progress: number;
  loaded: number;
  
  // 下载相关
  download_url?: string;
  chunk_size: number;
  part_info_list: IDownPartInfo[];
  remote_crc64?: string;
  is_multipart?: boolean;
  
  // 时间统计
  start_time?: number;
  end_time?: number;
  used_avg_speed?: number;
  used_time_len?: number;
}

/**
 * 下载选项接口
 */
export interface DownloadOptions {
  libraryId: string;
  spaceId: string;
  filePath: string;                    // 远端路径
  accessToken: string;
  userId?: string;

  chunkSize?: number;                  // 分块大小，单位MB，默认5MB
  parallel?: number;                   // 并发数，默认2
  partFileSize?: number;               // 分块下载阈值，单位MB，默认32MB
  trafficLimit?: number;               // 单链接限速
  
  // 回调函数
  onStateChange?: (checkpoint: DownloadCheckpoint, state: TaskStatus, error?: Error) => void;
  onProgress?: (progress: ProgressInfo) => void;
  onPartComplete?: (checkpoint: DownloadCheckpoint, partInfo: IDownPartInfo) => void;
  
  // 断点续传
  checkpoint?: DownloadCheckpoint;
  
  verbose?: boolean;
}

/**
 * 浏览器 URL 下载选项
 */
export interface UrlDownloadOptions {
  libraryId: string;
  spaceId: string;
  filePath: string;
  accessToken: string;
  userId?: string;
  trafficLimit?: number;
  /** 下载保存的文件名，默认从 filePath 提取 */
  fileName?: string;
}

/**
 * CommonLoader 构造选项
 */
export interface CommonLoaderOptions {
  verbose?: boolean;
  id?: string;
}
