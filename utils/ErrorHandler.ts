/**
 * ErrorHandler - SMH JS SDK 统一错误处理
 * 浏览器环境适配版本
 */

export interface ErrorAnalysis {
  statusCode?: number;
  isExpired: boolean;
}

/**
 * 分析错误，判断是否为过期错误
 */
export function analyzeError(error: any): ErrorAnalysis {
  const statusCode = error?.response?.status || error?.status || error?.statusCode;
  const isExpired = statusCode === 403 || (error as Error)?.message?.includes('Request has expired');
  return {
    statusCode,
    isExpired
  };
}

/**
 * SMH SDK 错误代码
 */
export enum ErrorCode {
  // 文件相关错误
  FILE_NOT_FOUND = 'FileNotFound',
  FILE_MODIFIED = 'FileModified',
  FILE_SIZE_MISMATCH = 'FileSizeMismatch',
  FILE_CRC64_MISMATCH = 'FileCrc64Mismatch',
  FILE_TOO_LARGE = 'FileTooLarge',
  INVALID_FILE = 'InvalidFile',
  
  // 上传相关错误
  UPLOAD_FAILED = 'UploadFailed',
  UPLOAD_CANCELED = 'UploadCanceled',
  UPLOAD_PAUSED = 'UploadPaused',
  PART_UPLOAD_FAILED = 'PartUploadFailed',
  RENEW_UPLOAD_FAILED = 'RenewUploadFailed',
  
  // 下载相关错误
  DOWNLOAD_FAILED = 'DownloadFailed',
  DOWNLOAD_CANCELED = 'DownloadCanceled',
  DOWNLOAD_PAUSED = 'DownloadPaused',
  
  // 参数相关错误
  INVALID_PARAMETER = 'InvalidParameter',
  
  // 网络相关错误
  NETWORK_ERROR = 'NetworkError',
  REQUEST_TIMEOUT = 'RequestTimeout',
  
  // 服务端错误（5xx）
  SERVER_ERROR = 'ServerError',
  
  // 其他错误
  OPERATION_FAILED = 'OperationFailed'
}

/**
 * SMH SDK 错误接口定义
 */
export interface ISMHError {
  message: string;
  code: ErrorCode;
  status?: number;
  reqId?: string;
  response?: Record<string, any>;
  cause?: Error;
  timestamp: number;
}

/**
 * SMH SDK 统一错误类
 */
export class SMHError extends Error implements ISMHError {
  name: string = 'SMHError';
  public readonly code: ErrorCode;
  public readonly status?: number;
  public readonly reqId?: string;
  public readonly response: Record<string, any> = {};
  public readonly cause?: Error;
  public readonly timestamp: number;
  
  constructor(
    err: ErrorCode | ISMHError | SMHError | Error | string,
    message?: string,
    cause?: Error,
    response?: Record<string, any>
  ) {
    let msg: string;
    if (typeof err === 'string') {
      if (Object.values(ErrorCode).includes(err as ErrorCode)) {
        msg = message || err;
      } else {
        msg = err;
      }
    } else if (err instanceof Error) {
      msg = message || err.message;
    } else if (typeof err === 'object' && 'message' in err) {
      msg = message || err.message;
    } else {
      msg = message || 'Unknown error';
    }
    
    super(msg);
    this.name = 'SMHError';
    
    Object.setPrototypeOf(this, SMHError.prototype);
    
    this.timestamp = Date.now();
    
    if (typeof err === 'string' && Object.values(ErrorCode).includes(err as ErrorCode)) {
      this.code = err as ErrorCode;
      this.cause = cause;
      if (response) {
        Object.assign(this.response, response);
      }
    } else if (err instanceof SMHError) {
      this.code = err.code;
      this.status = err.status;
      this.reqId = err.reqId;
      this.cause = err.cause;
      Object.assign(this.response, err.response);
    } else if (err instanceof Error) {
      this.code = ErrorCode.OPERATION_FAILED;
      this.cause = err;
    } else if (typeof err === 'object' && 'code' in err) {
      this.code = err.code;
      this.status = err.status;
      this.reqId = err.reqId;
      this.cause = err.cause;
      if (err.response) {
        Object.assign(this.response, err.response);
      }
    } else {
      this.code = ErrorCode.OPERATION_FAILED;
    }
    
    if (response) {
      Object.assign(this.response, response);
    }
    
    if (this.cause && this.cause.stack) {
      this.stack = `${this.stack}\nCaused by: ${this.cause.stack}`;
    }
  }
  
  /**
   * 转换为日志字符串
   */
  toLogString(): string {
    const parts: string[] = [];
    
    parts.push(`[${this.code}] ${this.message}`);
    
    if (this.status) {
      parts.push(`Status: ${this.status}`);
    }
    if (this.reqId) {
      parts.push(`ReqId: ${this.reqId}`);
    }
    
    if (Object.keys(this.response).length > 0) {
      parts.push('Response:');
      for (const [key, value] of Object.entries(this.response)) {
        if (typeof value === 'object') {
          parts.push(`  ${key}: ${JSON.stringify(value)}`);
        } else {
          parts.push(`  ${key}: ${value}`);
        }
      }
    }
    
    if (this.cause) {
      parts.push(`Caused by: ${this.cause.message}`);
    }
    
    return parts.join('\n');
  }
  
  /**
   * 转换为 JSON 格式
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      status: this.status,
      reqId: this.reqId,
      response: this.response,
      timestamp: this.timestamp,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message
      } : undefined
    };
  }
}

/**
 * AxiosError 中提取的后端错误详情
 */
export interface AxiosErrorInfo {
  status?: number;
  serverCode?: string;
  serverMessage?: string;
  responseData?: Record<string, any>;
  reqId?: string;
  isNetworkError: boolean;
}

/**
 * 从 AxiosError 中提取后端返回的错误详情
 */
export function extractAxiosErrorInfo(error: any): AxiosErrorInfo {
  const result: AxiosErrorInfo = {
    isNetworkError: false
  };

  // 检查是否是 AxiosError（兼容 axios.isAxiosError 和 duck-typing）
  const axiosResponse = error?.response;
  const isAxiosLikeError = Boolean(error?.isAxiosError || error?.config || error?.request || axiosResponse);

  const readHeaderValue = (headers: any, key: string): string | undefined => {
    if (!headers) return undefined;

    // axios 在浏览器端 headers 已经是小写 key，直接查一次即可
    const lowerKey = key.toLowerCase();
    const direct = headers[lowerKey] ?? headers[key];
    if (typeof direct === 'string' && direct) return direct;
    if (Array.isArray(direct) && typeof direct[0] === 'string') return direct[0];

    // 兼容 Headers 实例（fetch 场景）
    if (typeof headers.get === 'function') {
      const viaGet = headers.get(lowerKey);
      if (typeof viaGet === 'string' && viaGet) return viaGet;
      if (Array.isArray(viaGet) && typeof viaGet[0] === 'string') return viaGet[0];
    }

    return undefined;
  };

  if (axiosResponse) {
    result.status = axiosResponse.status;

    const data = axiosResponse.data;
    if (data && typeof data === 'object') {
      result.responseData = data;
      // SMH 后端标准错误格式：{ code: 'QuotaLimitReached', message: '...' }
      if (data.code) {
        result.serverCode = data.code;
      }
      if (data.message) {
        result.serverMessage = data.message;
      }
      result.reqId = data.requestId || data.reqId || data.requestID;
    } else if (typeof data === 'string' && data.length > 0) {
      result.serverMessage = data;
    }

    const headers = axiosResponse.headers;
    result.reqId = result.reqId
      || readHeaderValue(headers, 'x-request-id')
      || readHeaderValue(headers, 'x-smh-request-id')
      || readHeaderValue(headers, 'x-cos-request-id')
      || readHeaderValue(headers, 'requestid')
      || readHeaderValue(headers, 'reqid');
  }

  const axiosCode = typeof error?.code === 'string' ? error.code : '';
  const isNoResponseAxiosError = isAxiosLikeError && !axiosResponse;
  const isKnownNetworkCode = [
    'ERR_NETWORK',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'ECONNREFUSED',
    'ECONNRESET',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'EPIPE',
  ].includes(axiosCode);
  const message = typeof error?.message === 'string' ? error.message : '';
  const isKnownNetworkMessage = /network error|timeout|timed out|getaddrinfo|socket hang up|connection/i.test(message);

  if (isNoResponseAxiosError && (isKnownNetworkCode || isKnownNetworkMessage || Boolean(error?.request))) {
    result.isNetworkError = true;
  }

  return result;
}

/**
 * 创建 SMH SDK 错误的便捷函数
 */
export function newError(
  code: ErrorCode, 
  message: string, 
  cause?: Error, 
  response?: Record<string, any>,
  options?: { status?: number; reqId?: string }
): SMHError {
  // 通过 ISMHError 路径构造，直接设置 status/reqId，避免类型断言
  const mergedResponse = { ...response };
  if (options?.status != null && mergedResponse.status == null) {
    mergedResponse.status = options.status;
  }
  if (options?.reqId && mergedResponse.requestId == null) {
    mergedResponse.requestId = options.reqId;
  }

  return new SMHError({
    code,
    message,
    cause,
    status: options?.status,
    reqId: options?.reqId,
    response: mergedResponse,
    timestamp: Date.now(),
  });
}

/**
 * SMH 后端服务错误码（serverCode）
 * 对应后端 API 返回的 code 字段
 */
export enum ServerErrorCode {
  // ─── 400 Bad Request ──────────────────────────────────
  BadRequest = 'BadRequest',
  EmptyLibraryIdOrSecret = 'EmptyLibraryIdOrSecret',
  EmptyLibrarySecret = 'EmptyLibrarySecret',
  EmptyLibraryId = 'EmptyLibraryId',
  EmptySpaceId = 'EmptySpaceId',
  EmptyFileName = 'EmptyFileName',
  EmptyCosUploadId = 'EmptyCosUploadId',
  EmptyAccessToken = 'EmptyAccessToken',
  NotMultiSpaceLibrary = 'NotMultiSpaceLibrary',
  MultipartUploadIncomplete = 'MultipartUploadIncomplete',
  UploadIncomplete = 'UploadIncomplete',
  DirectoryNameLengthExceed = 'DirectoryNameLengthExceed',
  DirectoryNotAllowed = 'DirectoryNotAllowed',
  RootDirectoryNotAllowed = 'RootDirectoryNotAllowed',
  DirectoryLevelExceed = 'DirectoryLevelExceed',
  FileNameLengthExceed = 'FileNameLengthExceed',
  ExtnameNotAllowed = 'ExtnameNotAllowed',
  UploadToRootDirectoryNotAllowed = 'UploadToRootDirectoryNotAllowed',
  SourceDirectoryIsParentOfDestination = 'SourceDirectoryIsParentOfDestination',
  InvalidSourceDirectory = 'InvalidSourceDirectory',
  InvalidSourceFile = 'InvalidSourceFile',
  InvalidSpaceOrDirectoryPath = 'InvalidSpaceOrDirectoryPath',
  InvalidConflictResolutionStrategy = 'InvalidConflictResolutionStrategy',
  ParamInvalid = 'ParamInvalid',
  SpaceIdInvalid = 'SpaceIdInvalid',
  IllegalFileName = 'IllegalFileName',
  FileTypeNotMatched = 'FileTypeNotMatched',
  BadCrc64 = 'BadCrc64',
  QuotaLimitReached = 'QuotaLimitReached',
  FileUncompressNotAllowed = 'FileUncompressNotAllowed',
  SearchTooComplex = 'SearchTooComplex',
  SearchNotEnabled = 'SearchNotEnabled',
  RecycleBinNotEnabled = 'RecycleBinNotEnabled',
  QuotaSpacesInvalid = 'QuotaSpacesInvalid',
  SearchIdInvalid = 'SearchIdInvalid',
  InvalidDestinationPath = 'InvalidDestinationPath',
  MultipartUploadPartTooSmall = 'MultipartUploadPartTooSmall',
  IncompleteBody = 'IncompleteBody',
  TooManyItems = 'TooManyItems',
  NoItemsProvided = 'NoItemsProvided',
  InvalidTimeFormat = 'InvalidTimeFormat',
  OverwriteFileNotAllowed = 'OverwriteFileNotAllowed',
  InvalidFileHistoryCount = 'InvalidFileHistoryCount',
  InvalidFileHistoryExpireDay = 'InvalidFileHistoryExpireDay',
  InvalidFileHistoryMergeInterval = 'InvalidFileHistoryMergeInterval',
  SymlinkDepthLimitExceeded = 'SymlinkDepthLimitExceeded',
  SymlinkToDirectoryNotAllowed = 'SymlinkToDirectoryNotAllowed',
  SymlinkOverwriteConflict = 'SymlinkOverwriteConflict',
  UnsupportedSourceFormat = 'UnsupportedSourceFormat',
  UnsupportedTargetFormat = 'UnsupportedTargetFormat',
  FunctionNotEnabled = 'FunctionNotEnabled',
  UnsupportedFileType = 'UnsupportedFileType',
  QuotaCapacityLessThanSize = 'QuotaCapacityLessThanSize',
  QuotaCapacityRequired = 'QuotaCapacityRequired',
  InvalidDirectoryStatsType = 'InvalidDirectoryStatsType',
  ResourceMigrationNotEnabled = 'ResourceMigrationNotEnabled',
  ResourceNotSupported = 'ResourceNotSupported',
  ResolutionUpScalingNotAllowed = 'ResolutionUpScalingNotAllowed',
  M3u8OnlyMediaPlaylistAllowed = 'M3u8OnlyMediaPlaylistAllowed',
  M3u8HttpKeyNotAllowed = 'M3u8HttpKeyNotAllowed',
  M3u8HttpSegmentNotAllowed = 'M3u8HttpSegmentNotAllowed',
  M3u8PlaylistInvalid = 'M3u8PlaylistInvalid',
  M3u8SegmentsInvalid = 'M3u8SegmentsInvalid',
  M3u8InfoMapUnknown = 'M3u8InfoMapUnknown',
  M3u8InfoMapFieldUnknown = 'M3u8InfoMapFieldUnknown',
  OnlyVideoCanBeTranscoded = 'OnlyVideoCanBeTranscoded',
  CaptchaInvalid = 'CaptchaInvalid',
  WatermarkNotEnabled = 'WatermarkNotEnabled',
  GraphicCaptchaFailed = 'GraphicCaptchaFailed',
  CloseOldList = 'CloseOldList',

  // ─── 403 Forbidden ───────────────────────────────────
  NoPermission = 'NoPermission',
  AccessTokenNotMatchLibrary = 'AccessTokenNotMatchLibrary',
  AccessTokenNotMatchSpace = 'AccessTokenNotMatchSpace',
  AccessTokenVersionNotMatch = 'AccessTokenVersionNotMatch',
  InvalidAccessToken = 'InvalidAccessToken',
  ReadForbidden = 'ReadForbidden',
  WriteForbidden = 'WriteForbidden',
  LibraryServiceExpired = 'LibraryServiceExpired',
  LibraryInitializing = 'LibraryInitializing',
  OperationOnRawM3u8IsForbidden = 'OperationOnRawM3u8IsForbidden',
  SpaceBanned = 'SpaceBanned',
  ShareDisabled = 'ShareDisabled',
  ShareExpired = 'ShareExpired',
  ShareAuditing = 'ShareAuditing',
  ShareTokenInvalid = 'ShareTokenInvalid',
  ExtractionCodeInvalid = 'ExtractionCodeInvalid',
  LoginRequired = 'LoginRequired',
  ShareAccessDenied = 'ShareAccessDenied',
  AnonymousNotAllowed = 'AnonymousNotAllowed',
  CannotPreview = 'CannotPreview',
  CannotDownload = 'CannotDownload',
  CannotSaveToNetDisk = 'CannotSaveToNetDisk',
  CannotModify = 'CannotModify',
  ShareServiceDisabled = 'ShareServiceDisabled',

  // ─── 404 Not Found ───────────────────────────────────
  ConfirmKeyNotFound = 'ConfirmKeyNotFound',
  RouteNotFound = 'RouteNotFound',
  LibraryNotFound = 'LibraryNotFound',
  SpaceNotFound = 'SpaceNotFound',
  DirectoryNotFound = 'DirectoryNotFound',
  SourceDirectoryNotFound = 'SourceDirectoryNotFound',
  SourceFileNotFound = 'SourceFileNotFound',
  UploadNotFound = 'UploadNotFound',
  FileNotFound = 'FileNotFound',
  PathNotFound = 'PathNotFound',
  MarkerNotFound = 'MarkerNotFound',
  NoQuota = 'NoQuota',
  QuotaNotFound = 'QuotaNotFound',
  WrongLibraryIdOrSecret = 'WrongLibraryIdOrSecret',
  FavoriteIdNotFound = 'FavoriteIdNotFound',
  FileRemovedByQuota = 'FileRemovedByQuota',
  CosObjectNonexistent = 'CosObjectNonexistent',
  RootLinkFileNotFound = 'RootLinkFileNotFound',
  TrafficStatsNotFound = 'TrafficStatsNotFound',
  M3u8Converting = 'M3u8Converting',
  ShareNotFound = 'ShareNotFound',
  FileNotInShare = 'FileNotInShare',
  ShareFileEmpty = 'ShareFileEmpty',

  // ─── 408 Request Timeout ─────────────────────────────
  ReadRequestTimeout = 'ReadRequestTimeout',

  // ─── 409 Conflict ────────────────────────────────────
  DuplicateQuota = 'DuplicateQuota',
  UploadComplete = 'UploadComplete',
  SameNameDirectoryOrFileExists = 'SameNameDirectoryOrFileExists',
  DuplicateFavoriteRecord = 'DuplicateFavoriteRecord',
  SpaceNotEmpty = 'SpaceNotEmpty',
  PathConflict = 'PathConflict',
  RenameTooManyTimes = 'RenameTooManyTimes',
  CircleSymlink = 'CircleSymlink',
  ShareHasBeenUpdated = 'ShareHasBeenUpdated',

  // ─── 413 / 414 / 429 / 431 ──────────────────────────
  RequestEntityTooLarge = 'RequestEntityTooLarge',
  URITooLong = 'URITooLong',
  RateLimitExceeded = 'RateLimitExceeded',
  HeaderFieldsTooLarge = 'HeaderFieldsTooLarge',

  // ─── 451 ─────────────────────────────────────────────
  SensitiveContentRecognized = 'SensitiveContentRecognized',

  // ─── 499 ─────────────────────────────────────────────
  ClientDisconnected = 'ClientDisconnected',

  // ─── 500 / 503 ──────────────────────────────────────
  ServerOverloaded = 'ServerOverloaded',
  InternalServerError = 'InternalServerError',
  RequestTimeout = 'RequestTimeout',
}

/**
 * 后端 serverCode → 中文用户友好消息映射表
 * 
 * 设计原则：
 * 1. 面向最终用户，使用简洁、无技术术语的中文描述
 * 2. 尽量提供可操作性提示（告诉用户怎么做）
 * 3. 对开发者不可见的内部错误使用通用描述
 * 4. 调用方可以通过 setServerErrorMessages() 自定义或覆盖映射
 */
const serverErrorMessages: Record<string, string> = {
  // ─── 400 Bad Request ──────────────────────────────────
  [ServerErrorCode.BadRequest]: '请求无效，请检查后重试',
  [ServerErrorCode.EmptyLibraryIdOrSecret]: '媒体库配置信息缺失',
  [ServerErrorCode.EmptyLibrarySecret]: '媒体库密钥不能为空',
  [ServerErrorCode.EmptyLibraryId]: '媒体库 ID 不能为空',
  [ServerErrorCode.EmptySpaceId]: '空间 ID 不能为空',
  [ServerErrorCode.EmptyFileName]: '文件名不能为空',
  [ServerErrorCode.EmptyCosUploadId]: '上传标识缺失，请重新上传',
  [ServerErrorCode.EmptyAccessToken]: '访问令牌不能为空，请先登录',
  [ServerErrorCode.NotMultiSpaceLibrary]: '当前媒体库不支持多空间操作',
  [ServerErrorCode.MultipartUploadIncomplete]: '分片上传尚未完成，无法确认',
  [ServerErrorCode.UploadIncomplete]: '文件上传尚未完成，无法确认',
  [ServerErrorCode.DirectoryNameLengthExceed]: '文件夹名称过长，请缩短后重试',
  [ServerErrorCode.DirectoryNotAllowed]: '当前媒体库不允许创建文件夹',
  [ServerErrorCode.RootDirectoryNotAllowed]: '不允许对根目录执行此操作',
  [ServerErrorCode.DirectoryLevelExceed]: '当前媒体库只允许创建一级文件夹',
  [ServerErrorCode.FileNameLengthExceed]: '文件名过长，请缩短后重试',
  [ServerErrorCode.ExtnameNotAllowed]: '当前媒体库不允许此文件类型',
  [ServerErrorCode.UploadToRootDirectoryNotAllowed]: '不允许将文件上传到根目录',
  [ServerErrorCode.SourceDirectoryIsParentOfDestination]: '不能将文件夹移动到其子文件夹中',
  [ServerErrorCode.InvalidSourceDirectory]: '源文件夹无效',
  [ServerErrorCode.InvalidSourceFile]: '源文件无效',
  [ServerErrorCode.InvalidSpaceOrDirectoryPath]: '空间或目录路径不存在',
  [ServerErrorCode.InvalidConflictResolutionStrategy]: '冲突处理策略无效',
  [ServerErrorCode.ParamInvalid]: '请求参数无效，请检查后重试',
  [ServerErrorCode.SpaceIdInvalid]: '空间 ID 格式无效',
  [ServerErrorCode.IllegalFileName]: '文件名包含非法字符（\\ / : * ? " < > |）',
  [ServerErrorCode.FileTypeNotMatched]: '目标文件类型与源文件不匹配',
  [ServerErrorCode.BadCrc64]: '文件校验失败，数据可能已损坏，请重新上传',
  [ServerErrorCode.QuotaLimitReached]: '存储空间不足，请清理文件或扩容',
  [ServerErrorCode.FileUncompressNotAllowed]: '仅支持解压压缩包文件',
  [ServerErrorCode.SearchTooComplex]: '搜索条件过于复杂，请简化后重试',
  [ServerErrorCode.SearchNotEnabled]: '搜索功能未启用',
  [ServerErrorCode.RecycleBinNotEnabled]: '回收站功能未启用',
  [ServerErrorCode.QuotaSpacesInvalid]: '配额关联的空间无效',
  [ServerErrorCode.SearchIdInvalid]: '搜索标识无效',
  [ServerErrorCode.InvalidDestinationPath]: '目标路径无效',
  [ServerErrorCode.MultipartUploadPartTooSmall]: '分片大小过小，无法完成上传',
  [ServerErrorCode.IncompleteBody]: '请求数据不完整，请重试',
  [ServerErrorCode.TooManyItems]: '批量操作数量超过上限（最多 1000 项）',
  [ServerErrorCode.NoItemsProvided]: '批量操作至少需要一项内容',
  [ServerErrorCode.InvalidTimeFormat]: '时间格式不正确',
  [ServerErrorCode.OverwriteFileNotAllowed]: '开启历史版本后不允许覆盖文件',
  [ServerErrorCode.InvalidFileHistoryCount]: '文件历史版本数量参数无效',
  [ServerErrorCode.InvalidFileHistoryExpireDay]: '文件历史版本过期天数参数无效',
  [ServerErrorCode.InvalidFileHistoryMergeInterval]: '版本合并间隔参数无效（5～600 秒）',
  [ServerErrorCode.SymlinkDepthLimitExceeded]: '快捷方式嵌套层级超出限制',
  [ServerErrorCode.SymlinkToDirectoryNotAllowed]: '快捷方式不能指向文件夹',
  [ServerErrorCode.SymlinkOverwriteConflict]: '快捷方式和普通文件不能互相覆盖',
  [ServerErrorCode.UnsupportedSourceFormat]: '不支持的源文件格式，请使用 .txt、.doc 或 .docx 文件',
  [ServerErrorCode.UnsupportedTargetFormat]: '目标文件格式必须为 PDF',
  [ServerErrorCode.FunctionNotEnabled]: '该功能未启用',
  [ServerErrorCode.UnsupportedFileType]: '文件夹或快捷方式不支持历史版本',
  [ServerErrorCode.QuotaCapacityLessThanSize]: '配额容量不能小于当前已使用空间',
  [ServerErrorCode.QuotaCapacityRequired]: '需要指定配额容量',
  [ServerErrorCode.InvalidDirectoryStatsType]: '目录统计类型无效',
  [ServerErrorCode.ResourceMigrationNotEnabled]: '资源迁移功能未启用',
  [ServerErrorCode.ResourceNotSupported]: '不支持的资源类型',
  [ServerErrorCode.ResolutionUpScalingNotAllowed]: '目标分辨率不能高于原视频分辨率',
  [ServerErrorCode.M3u8OnlyMediaPlaylistAllowed]: '仅支持 M3U8 媒体播放列表',
  [ServerErrorCode.M3u8HttpKeyNotAllowed]: 'M3U8 不允许使用 HTTP 密钥',
  [ServerErrorCode.M3u8HttpSegmentNotAllowed]: 'M3U8 不允许使用 HTTP 分段',
  [ServerErrorCode.M3u8PlaylistInvalid]: 'M3U8 播放列表无效',
  [ServerErrorCode.M3u8SegmentsInvalid]: 'M3U8 分段无效',
  [ServerErrorCode.M3u8InfoMapUnknown]: 'M3U8 信息映射未知',
  [ServerErrorCode.M3u8InfoMapFieldUnknown]: 'M3U8 信息映射字段未知',
  [ServerErrorCode.OnlyVideoCanBeTranscoded]: '仅视频文件支持转码',
  [ServerErrorCode.CaptchaInvalid]: '验证码无效，请重新输入',
  [ServerErrorCode.WatermarkNotEnabled]: '水印功能未启用',
  [ServerErrorCode.GraphicCaptchaFailed]: '图形验证码验证失败',
  [ServerErrorCode.CloseOldList]: '旧版接口已关闭，请使用新版接口',

  // ─── 403 Forbidden ───────────────────────────────────
  [ServerErrorCode.NoPermission]: '没有操作权限',
  [ServerErrorCode.AccessTokenNotMatchLibrary]: '访问令牌与媒体库不匹配',
  [ServerErrorCode.AccessTokenNotMatchSpace]: '访问令牌与空间不匹配',
  [ServerErrorCode.AccessTokenVersionNotMatch]: '访问令牌版本不匹配',
  [ServerErrorCode.InvalidAccessToken]: '访问令牌无效或已过期，请重新登录',
  [ServerErrorCode.ReadForbidden]: '没有读取权限',
  [ServerErrorCode.WriteForbidden]: '没有写入权限',
  [ServerErrorCode.LibraryServiceExpired]: '媒体库服务已过期',
  [ServerErrorCode.LibraryInitializing]: '媒体库正在初始化，请稍后重试',
  [ServerErrorCode.OperationOnRawM3u8IsForbidden]: '不允许操作原始 M3U8 文件',
  [ServerErrorCode.SpaceBanned]: '空间已被禁用',
  [ServerErrorCode.ShareDisabled]: '分享功能已关闭',
  [ServerErrorCode.ShareExpired]: '分享链接已过期',
  [ServerErrorCode.ShareAuditing]: '分享链接正在审核中',
  [ServerErrorCode.ShareTokenInvalid]: '分享令牌无效',
  [ServerErrorCode.ExtractionCodeInvalid]: '提取码错误',
  [ServerErrorCode.LoginRequired]: '请先登录后访问',
  [ServerErrorCode.ShareAccessDenied]: '您无权访问此分享',
  [ServerErrorCode.AnonymousNotAllowed]: '不允许匿名用户访问',
  [ServerErrorCode.CannotPreview]: '该文件不支持预览',
  [ServerErrorCode.CannotDownload]: '该文件不允许下载',
  [ServerErrorCode.CannotSaveToNetDisk]: '不允许保存到网盘',
  [ServerErrorCode.CannotModify]: '该文件不允许修改',
  [ServerErrorCode.ShareServiceDisabled]: '分享服务已关闭',

  // ─── 404 Not Found ───────────────────────────────────
  [ServerErrorCode.ConfirmKeyNotFound]: '上传确认信息未找到，请重新上传',
  [ServerErrorCode.RouteNotFound]: '请求的接口不存在',
  [ServerErrorCode.LibraryNotFound]: '媒体库不存在',
  [ServerErrorCode.SpaceNotFound]: '空间不存在',
  [ServerErrorCode.DirectoryNotFound]: '文件夹不存在',
  [ServerErrorCode.SourceDirectoryNotFound]: '源文件夹不存在',
  [ServerErrorCode.SourceFileNotFound]: '源文件不存在',
  [ServerErrorCode.UploadNotFound]: '上传任务不存在或已过期',
  [ServerErrorCode.FileNotFound]: '文件不存在',
  [ServerErrorCode.PathNotFound]: '路径不存在',
  [ServerErrorCode.MarkerNotFound]: '分页标记未找到',
  [ServerErrorCode.NoQuota]: '该空间未设置配额',
  [ServerErrorCode.QuotaNotFound]: '配额不存在',
  [ServerErrorCode.WrongLibraryIdOrSecret]: '媒体库 ID 或密钥错误',
  [ServerErrorCode.FavoriteIdNotFound]: '收藏记录不存在',
  [ServerErrorCode.FileRemovedByQuota]: '文件因超出配额已被删除',
  [ServerErrorCode.CosObjectNonexistent]: '文件存储对象不存在',
  [ServerErrorCode.RootLinkFileNotFound]: '快捷方式指向的文件不存在',
  [ServerErrorCode.TrafficStatsNotFound]: '流量统计信息不存在',
  [ServerErrorCode.M3u8Converting]: 'M3U8 正在转码中，请稍后重试',
  [ServerErrorCode.ShareNotFound]: '分享不存在',
  [ServerErrorCode.FileNotInShare]: '文件不在分享范围内',
  [ServerErrorCode.ShareFileEmpty]: '分享中没有文件',

  // ─── 408 Request Timeout ─────────────────────────────
  [ServerErrorCode.ReadRequestTimeout]: '请求超时，请重试',

  // ─── 409 Conflict ────────────────────────────────────
  [ServerErrorCode.DuplicateQuota]: '该空间已存在配额',
  [ServerErrorCode.UploadComplete]: '上传已完成，无法重复操作',
  [ServerErrorCode.SameNameDirectoryOrFileExists]: '已存在同名文件或文件夹',
  [ServerErrorCode.DuplicateFavoriteRecord]: '该文件已收藏',
  [ServerErrorCode.SpaceNotEmpty]: '空间非空，无法删除',
  [ServerErrorCode.PathConflict]: '操作冲突，请避免同时操作同一文件',
  [ServerErrorCode.RenameTooManyTimes]: '重命名次数过多，请稍后重试',
  [ServerErrorCode.CircleSymlink]: '检测到快捷方式循环引用',
  [ServerErrorCode.ShareHasBeenUpdated]: '分享已被更新，请刷新后重试',

  // ─── 413 / 414 / 429 / 431 ──────────────────────────
  [ServerErrorCode.RequestEntityTooLarge]: '请求内容过大',
  [ServerErrorCode.URITooLong]: '请求地址过长',
  [ServerErrorCode.RateLimitExceeded]: '操作过于频繁，请稍后重试',
  [ServerErrorCode.HeaderFieldsTooLarge]: '请求头信息过大',

  // ─── 451 ─────────────────────────────────────────────
  [ServerErrorCode.SensitiveContentRecognized]: '内容包含敏感信息，操作被拒绝',

  // ─── 499 ─────────────────────────────────────────────
  [ServerErrorCode.ClientDisconnected]: '连接已断开',

  // ─── 500 / 503 ──────────────────────────────────────
  [ServerErrorCode.ServerOverloaded]: '服务器繁忙，请稍后重试',
  [ServerErrorCode.InternalServerError]: '服务器内部错误，请稍后重试',
  [ServerErrorCode.RequestTimeout]: '服务器处理超时，请稍后重试',
};

/**
 * SDK 当前语言环境
 * - 'zh-CN'（默认）：使用中文映射表
 * - 'en'：跳过中文映射，直接使用后端返回的英文 message
 */
export type SMHLocale = 'zh-CN' | 'en';
let currentLocale: SMHLocale = 'zh-CN';

/**
 * 设置 SDK 错误消息的语言
 * 
 * @example
 * ```ts
 * setErrorLocale('en');  // 使用后端返回的英文 message
 * setErrorLocale('zh-CN'); // 使用 SDK 内置的中文映射（默认）
 * ```
 */
export function setErrorLocale(locale: SMHLocale): void {
  currentLocale = locale;
}

/**
 * 获取当前 SDK 错误消息语言
 */
export function getErrorLocale(): SMHLocale {
  return currentLocale;
}

/**
 * 根据后端 serverCode 获取用户友好消息
 * 
 * - locale 为 'zh-CN' 时：优先查中文映射表，未匹配则使用 fallback
 * - locale 为 'en' 时：跳过中文映射，直接返回 fallback（由调用方传入后端原始英文 message）
 * 
 * @param serverCode - 后端返回的错误码，如 'QuotaLimitReached'
 * @param fallback - 未匹配时的回退消息，默认为 undefined
 * 
 * @example
 * ```ts
 * setLocale('zh-CN');
 * getServerErrorMessage('QuotaLimitReached'); 
 * // => '存储空间不足，请清理文件或扩容'
 * 
 * setLocale('en');
 * getServerErrorMessage('QuotaLimitReached'); 
 * // => undefined（调用方会 fallback 到后端英文 message）
 * ```
 */
export function getServerErrorMessage(serverCode: string | undefined, fallback?: string): string | undefined {
  if (!serverCode) return fallback;
  if (currentLocale === 'en') return fallback;
  return serverErrorMessages[serverCode] ?? fallback;
}

/**
 * 批量自定义或覆盖后端 serverCode 的中文映射
 * 
 * 调用方可根据产品需要自定义错误提示文案：
 * @example
 * ```ts
 * setServerErrorMessages({
 *   'QuotaLimitReached': '您的网盘空间已满，请升级套餐',
 *   'NoPermission': '您没有权限执行此操作，请联系管理员',
 * });
 * ```
 */
export function setServerErrorMessages(customMessages: Record<string, string>): void {
  Object.assign(serverErrorMessages, customMessages);
}

// 保存默认映射表的快照，用于 reset
const defaultServerErrorMessages: Readonly<Record<string, string>> = { ...serverErrorMessages };

/**
 * 恢复后端 serverCode 中文映射为默认值
 * 
 * 用于撤销 setServerErrorMessages() 的自定义覆盖：
 * @example
 * ```ts
 * resetServerErrorMessages();
 * ```
 */
export function resetServerErrorMessages(): void {
  // 清空当前映射，重新填入默认值
  for (const key of Object.keys(serverErrorMessages)) {
    delete serverErrorMessages[key];
  }
  Object.assign(serverErrorMessages, defaultServerErrorMessages);
}

/**
 * 将任意错误包装为 SMHError（公共方法）
 * 
 * 供 Uploader、Downloader、SmhClient 等模块统一使用，
 * 避免各处重复编写 extractAxiosErrorInfo + getServerErrorMessage + newError 逻辑。
 * 
 * @param e - 原始错误
 * @param defaultCode - 当无法判断为网络/服务端错误时使用的默认 ErrorCode
 * @param fallbackMessage - 无法从后端提取消息时使用的回退消息
 * @param extraResponse - 附加到 SMHError.response 中的额外信息
 */
export function wrapErrorToSMHError(
  e: any,
  defaultCode: ErrorCode,
  fallbackMessage: string,
  extraResponse?: Record<string, any>,
): SMHError {
  if (e instanceof SMHError) {
    return e;
  }

  const axiosInfo = extractAxiosErrorInfo(e);
  const userMessage = getServerErrorMessage(axiosInfo.serverCode)
    || axiosInfo.serverMessage || e?.message || fallbackMessage;

  let code: ErrorCode;
  if (axiosInfo.isNetworkError) {
    code = ErrorCode.NETWORK_ERROR;
  } else if (axiosInfo.status != null && axiosInfo.status >= 500) {
    code = ErrorCode.SERVER_ERROR;
  } else {
    code = defaultCode;
  }

  return newError(
    code,
    userMessage,
    e instanceof Error ? e : undefined,
    {
      ...extraResponse,
      ...(axiosInfo.serverCode && { serverCode: axiosInfo.serverCode }),
      ...(axiosInfo.serverMessage && { serverMessage: axiosInfo.serverMessage }),
      ...(axiosInfo.responseData && { responseData: axiosInfo.responseData }),
      ...(axiosInfo.reqId && { requestId: axiosInfo.reqId }),
    },
    { status: axiosInfo.status, reqId: axiosInfo.reqId }
  );
}
