/// <reference types="node" />
/**
 * 集成测试辅助模块
 * - 从环境变量加载真实配置
 * - 提供共享的 SMHClient 实例
 * - 提供测试数据生成工具
 */
import { SMHClient } from '../../interceptor/SmhClient';

export interface IntegrationConfig {
  basePath: string;
  libraryId: string;
  spaceId: string;
  accessToken: string;
}

/**
 * 从环境变量读取集成测试配置
 * 缺少任何必要配置时跳过测试
 */
export function getConfig(): IntegrationConfig {
  const basePath = process.env.SMH_BASE_PATH;
  const libraryId = process.env.SMH_LIBRARY_ID;
  const spaceId = process.env.SMH_SPACE_ID;
  const accessToken = process.env.SMH_ACCESS_TOKEN;

  if (!basePath || !libraryId || !spaceId || !accessToken) {
    throw new Error(
      '缺少集成测试环境变量，请在 .env 文件中配置：\n' +
        'SMH_BASE_PATH, SMH_LIBRARY_ID, SMH_SPACE_ID, SMH_ACCESS_TOKEN\n' +
        '可参考 .env.example'
    );
  }

  return { basePath, libraryId, spaceId, accessToken };
}

/**
 * 创建共享的 SMHClient 实例
 */
export function createTestClient(config?: IntegrationConfig): SMHClient {
  const cfg = config || getConfig();
  return new SMHClient({
    basePath: cfg.basePath,
    libraryId: cfg.libraryId,
    spaceId: cfg.spaceId,
    accessToken: cfg.accessToken,
    timeout: 30000,
  });
}

/**
 * 生成随机文本内容
 */
export function generateTextContent(sizeInBytes: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < sizeInBytes; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机 Buffer 内容
 */
export function generateRandomBuffer(sizeInBytes: number): Buffer {
  const buffer = Buffer.alloc(sizeInBytes);
  for (let i = 0; i < sizeInBytes; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  return buffer;
}

/**
 * 生成带时间戳的唯一文件路径，避免测试间冲突
 */
export function uniquePath(prefix: string, ext: string = '.txt'): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `__sdk_test__/${prefix}_${ts}_${rand}${ext}`;
}

/**
 * 等待指定毫秒
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 检查集成测试是否可运行，不可运行则跳过整个 describe
 */
export function skipIfNoConfig(): boolean {
  try {
    getConfig();
    return false;
  } catch {
    return true;
  }
}
