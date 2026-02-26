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
 * 使用链式哈希算法：每 1MB 计算一次哈希，然后将哈希值作为下一个块的输入
 * 用于秒传检测的第二阶段
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
  const blockSize = HASH_CHUNK_SIZE; // 1MB
  let totalBytesRead = 0;
  let hasher = await createSHA256();
  hasher.init();
  let fullHash = '';
  let count = 0;

  // 分块读取文件
  let offset = 0;
  while (offset < fileSize) {
    const end = Math.min(offset + blockSize * 4, fileSize); // 每次读取 4MB
    const blob = file.slice(offset, end);
    const buffer = await blobToArrayBuffer(blob);
    const chunk = new Uint8Array(buffer);
    
    let position = 0;
    while (position < chunk.length) {
      const remaining = blockSize - count;
      const available = chunk.length - position;
      
      if (count + available < blockSize) {
        // 当前块不足 1MB，继续累积
        hasher.update(chunk.slice(position));
        count += available;
        position = chunk.length;
      } else {
        // 当前块达到 1MB，计算哈希
        hasher.update(chunk.slice(position, position + remaining));
        fullHash = hasher.digest('hex');
        
        // 创建新的哈希器，将上一个哈希值作为输入
        hasher = await createSHA256();
        hasher.init();
        hasher.update(hexToUint8Array(fullHash));
        
        position += remaining;
        count = 0;
        
        // 处理剩余数据
        if (position < chunk.length) {
          const leftover = chunk.slice(position);
          hasher.update(leftover);
          count = leftover.length;
          position = chunk.length;
        }
      }
    }
    
    totalBytesRead += chunk.length;
    offset = end;
    
    // 更新进度
    if (onProgress) {
      const progress = Math.min(100, (totalBytesRead / fileSize) * 100);
      onProgress(progress);
    }
  }
  
  // 处理最后不足 1MB 的数据
  if (count !== 0) {
    fullHash = hasher.digest('hex');
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
