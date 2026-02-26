/**
 * CRC64 - CRC64-ECMA 校验计算
 * 纯 JavaScript BigInt 实现，适用于浏览器环境
 * 用于文件完整性校验
 */

// CRC64-ECMA 多项式
const POLY = BigInt('0xC96C5795D7870F42');
const MASK_64 = BigInt('0xFFFFFFFFFFFFFFFF');
const MASK_8 = BigInt(0xFF);
const BIGINT_1 = BigInt(1);
const BIGINT_8 = BigInt(8);

// CRC64 初始值
export const CRC64_INIT_VALUE = MASK_64;
const XOR_OUT = MASK_64;

// CRC64 查找表（延迟初始化）
let CRC64_TABLE: bigint[] | null = null;

/**
 * 初始化 CRC64 查找表
 */
function initCRC64Table(): void {
  if (CRC64_TABLE) return;
  
  CRC64_TABLE = new Array(256);
  
  for (let i = 0; i < 256; i++) {
    let crc = BigInt(i);
    for (let j = 0; j < 8; j++) {
      if (crc & BIGINT_1) {
        crc = (crc >> BIGINT_1) ^ POLY;
      } else {
        crc = crc >> BIGINT_1;
      }
    }
    CRC64_TABLE[i] = crc;
  }
}

/**
 * GF(2) 矩阵乘法
 */
function gf2MatrixTimes(mat: bigint[], vec: bigint): bigint {
  let sum = BigInt(0);
  let idx = 0;
  
  while (vec) {
    if (vec & BigInt(1)) {
      sum ^= mat[idx];
    }
    vec >>= BigInt(1);
    idx++;
  }
  
  return sum;
}

/**
 * GF(2) 矩阵平方
 */
function gf2MatrixSquare(square: bigint[], mat: bigint[]): void {
  for (let i = 0; i < 64; i++) {
    square[i] = gf2MatrixTimes(mat, mat[i]);
  }
}

/**
 * 更新 CRC64 值
 * @param crc 当前 CRC64 值
 * @param buffer 数据缓冲区（Uint8Array 或 ArrayBuffer）
 * @returns 更新后的 CRC64 值
 */
export function updateCRC64(crc: bigint, buffer: Uint8Array | ArrayBuffer): bigint {
  if (!CRC64_TABLE) {
    initCRC64Table();
  }
  
  const data = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  
  for (let i = 0; i < data.length; i++) {
    const index = Number((crc ^ BigInt(data[i])) & MASK_8);
    crc = (crc >> BIGINT_8) ^ CRC64_TABLE![index];
  }
  
  return crc;
}

/**
 * 完成 CRC64 计算，返回最终值
 * @param crc CRC64 累计值
 * @returns CRC64 最终值（十进制字符串）
 */
export function finalizeCRC64(crc: bigint): string {
  const finalCrc = (crc ^ XOR_OUT) & MASK_64;
  return finalCrc.toString(10);
}

/**
 * 合并两个 CRC64 值
 * 用于分片上传/下载时合并各分片的 CRC64
 * 
 * @param crc1 第一个分片的 CRC64（十进制字符串）
 * @param crc2 第二个分片的 CRC64（十进制字符串）
 * @param len2 第二个分片的长度
 * @returns 合并后的 CRC64（十进制字符串）
 */
export function combineCRC64(crc1: string, crc2: string, len2: number): string {
  if (len2 === 0) {
    return crc1;
  }
  
  if (!CRC64_TABLE) {
    initCRC64Table();
  }
  
  let crc = BigInt(crc1);
  
  const even: bigint[] = new Array(64);
  const odd: bigint[] = new Array(64);
  
  // 初始化操作矩阵
  odd[0] = POLY;
  let row = BigInt(1);
  for (let i = 1; i < 64; i++) {
    odd[i] = row;
    row <<= BigInt(1);
  }
  
  gf2MatrixSquare(even, odd);
  gf2MatrixSquare(odd, even);
  
  let len = len2;
  
  // 使用平方法快速计算
  while (len > 0) {
    gf2MatrixSquare(even, odd);
    if (len & 1) {
      crc = gf2MatrixTimes(even, crc);
    }
    len >>= 1;
    
    if (len === 0) break;
    
    gf2MatrixSquare(odd, even);
    if (len & 1) {
      crc = gf2MatrixTimes(odd, crc);
    }
    len >>= 1;
  }
  
  crc ^= BigInt(crc2);
  
  return (crc & MASK_64).toString(10);
}

/**
 * 合并多个分片的 CRC64
 * @param parts 分片信息数组，每个包含 crc64 和 size
 * @returns 合并后的 CRC64（十进制字符串）
 */
export function combinePartsCRC64(parts: Array<{ crc64: string; size: number }>): string {
  if (!parts || parts.length === 0) {
    return finalizeCRC64(CRC64_INIT_VALUE);
  }
  
  if (parts.length === 1) {
    return parts[0].crc64;
  }
  
  let combinedCrc64 = parts[0].crc64;
  
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    combinedCrc64 = combineCRC64(combinedCrc64, part.crc64, part.size);
  }
  
  return combinedCrc64;
}

/**
 * 计算 Blob 的 CRC64
 * @param blob Blob 数据
 * @param onProgress 可选的进度回调
 * @returns CRC64 值（十进制字符串）
 */
export async function calculateBlobCRC64(
  blob: Blob,
  onProgress?: (progress: number) => void
): Promise<string> {
  const chunkSize = 1024 * 1024; // 1MB chunks
  let crc = CRC64_INIT_VALUE;
  let offset = 0;
  
  while (offset < blob.size) {
    const end = Math.min(offset + chunkSize, blob.size);
    const chunk = blob.slice(offset, end);
    const buffer = await chunk.arrayBuffer();
    
    crc = updateCRC64(crc, buffer);
    offset = end;
    
    if (onProgress) {
      onProgress((offset / blob.size) * 100);
    }
  }
  
  return finalizeCRC64(crc);
}

/**
 * 计算 ArrayBuffer 的 CRC64
 * @param buffer ArrayBuffer 数据
 * @returns CRC64 值（十进制字符串）
 */
export function calculateBufferCRC64(buffer: ArrayBuffer): string {
  let crc = CRC64_INIT_VALUE;
  crc = updateCRC64(crc, buffer);
  return finalizeCRC64(crc);
}
