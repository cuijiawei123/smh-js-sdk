/**
 * Utils - 工具模块导出入口
 */

// 事件发射器
export { default as EventEmitter } from './EventEmitter';

// 错误处理
export { 
  SMHError, 
  ErrorCode, 
  newError, 
  analyzeError,
  type ISMHError,
  type ErrorAnalysis 
} from './ErrorHandler';

// 格式化工具
export { formatSize, formatTime, formatRemainingTime } from './Formatter';

// 异步工具
export { 
  parallelLimit, 
  delay, 
  withRetry,
  type ParallelLimitOptions 
} from './async';

// Hash 计算
export { 
  calculateBeginningHash, 
  calculateFullHash,
  sha256
} from './hash';

// CRC64 计算
export { 
  updateCRC64, 
  finalizeCRC64, 
  combineCRC64,
  combinePartsCRC64,
  calculateBlobCRC64,
  calculateBufferCRC64,
  CRC64_INIT_VALUE 
} from './crc64';

/**
 * 解析 COS 域名，提取 bucket 和 region
 * @param domain COS 域名，如 "bucket-123456.cos.ap-guangzhou.myqcloud.com"
 * 支持自定义域名场景，解析失败时返回空字符串而非抛错
 */
export function parseCOSDomain(domain: string): { bucket: string; region: string } {
  const match = domain.match(/^(.+)\.cos\.([^.]+)\.myqcloud\.com$/);
  if (!match) {
    // 自定义域名场景，无法解析 bucket 和 region，返回空值不阻断上传流程
    return {
      bucket: '',
      region: ''
    };
  }
  return {
    bucket: match[1],
    region: match[2]
  };
}
