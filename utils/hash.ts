/**
 * Hash - SHA256 哈希计算工具
 * 使用 hash-wasm 库实现，支持浏览器环境
 * 用于秒传检测
 */

import { createSHA256, IHasher } from 'hash-wasm';

// 哈希计算的块大小：1MB
const HASH_CHUNK_SIZE = 1 * 1024 * 1024;

/**
 * 将 Blob 转换为 ArrayBuffer
 */
async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer();
}

/**
 * 计算文件前 1MB 的 SHA256 哈希（beginningHash）
 * 用于秒传检测的第一阶段
 * 
 * @param file 浏览器 File 对象
 * @param fileSize 文件大小（字节）
 * @param onProgress 可选的进度回调
 * @returns SHA256 哈希值（十六进制字符串）
 */
export async function calculateBeginningHash(
  file: File,
  fileSize: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  const chunkSize = Math.min(fileSize, HASH_CHUNK_SIZE);
  
  // 获取文件前 1MB
  const blob = file.slice(0, chunkSize);
  const buffer = await blobToArrayBuffer(blob);
  
  // 创建 SHA256 哈希器
  const hasher = await createSHA256();
  hasher.init();
  hasher.update(new Uint8Array(buffer));
  
  if (onProgress) {
    onProgress(100);
  }
  
  return hasher.digest('hex');
}

/**
 * 计算文件的完整 SHA256 哈希（fullHash）
 * 使用链式哈希算法：从文件头开始，每 1MB 计算一次 SHA256，
 * 将哈希结果作为下一个块的链式输入，直到文件末尾
 * 
 * 算法与 Node SDK calculateFullHash 保持一致：
 * 每 1MB 块：update(chunk) → digest() → 新 hasher → update(上一个hash)
 * 前 1MB 的 digest 结果即为 beginningHash
 * 
 * @param file 浏览器 File 对象
 * @param fileSize 文件大小（字节）
 * @param onProgress 可选的进度回调
 * @returns SHA256 链式哈希值（十六进制字符串）
 */
export async function calculateFullHash(
  file: File,
  fileSize: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  const chunkSize = HASH_CHUNK_SIZE; // 1MB
  const totalChunks = Math.ceil(fileSize / chunkSize);
  
  let hasher = await createSHA256();
  hasher.init();
  let fullHash = '';

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const blob = file.slice(start, end);
    const buffer = await blobToArrayBuffer(blob);
    
    hasher.update(new Uint8Array(buffer));
    fullHash = hasher.digest('hex');
    
    if (i < totalChunks - 1) {
      hasher = await createSHA256();
      hasher.init();
      hasher.update(hexToUint8Array(fullHash));
    }
    
    if (onProgress) {
      const progress = Math.min(100, ((i + 1) / totalChunks) * 100);
      onProgress(progress);
    }
  }
  
  return fullHash;
}

/**
 * 将十六进制字符串转换为 Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * 计算 ArrayBuffer 的 SHA256 哈希
 * @param buffer ArrayBuffer 数据
 * @returns SHA256 哈希值
 */
export async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hasher = await createSHA256();
  hasher.init();
  hasher.update(new Uint8Array(buffer));
  return hasher.digest('hex');
}
