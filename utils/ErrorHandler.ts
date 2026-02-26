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
 * 创建 SMH SDK 错误的便捷函数
 */
export function newError(
  code: ErrorCode, 
  message: string, 
  cause?: Error, 
  response?: Record<string, any>
): SMHError {
  return new SMHError(code, message, cause, response);
}
