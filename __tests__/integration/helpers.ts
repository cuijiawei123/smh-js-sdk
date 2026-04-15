/// <reference types="node" />
/**
 * 集成测试辅助模块
 * - 从环境变量加载真实配置
 * - 在测试启动时动态签发 AccessToken
 * - 提供共享的 SMHClient 实例
 * - 提供测试数据生成工具
 */
import { SMHClient } from '../../interceptor/SmhClient';
import { CreateTokenGrantEnum } from '../../apis/token-api';
import { TaskStatus } from '../../loaders/types';

interface IntegrationBaseConfig {
  basePath: string;
  libraryId: string;
  spaceId: string;
  librarySecret: string;
  userId: string;
}

export interface IntegrationConfig {
  basePath: string;
  libraryId: string;
  spaceId: string;
  accessToken: string;
}

let cachedConfigPromise: Promise<IntegrationConfig> | null = null;

function getBaseConfig(): IntegrationBaseConfig {
  const basePath = process.env.SMH_BASE_PATH;
  const libraryId = process.env.SMH_LIBRARY_ID;
  const spaceId = process.env.SMH_SPACE_ID;
  const librarySecret = process.env.SMH_LIBRARY_SECRET;
  const userId = process.env.SMH_USER_ID;

  if (!basePath || !libraryId || !spaceId || !librarySecret || !userId) {
    throw new Error(
      '缺少集成测试环境变量，请在 .env 文件中配置：\n' +
        'SMH_BASE_PATH, SMH_LIBRARY_ID, SMH_SPACE_ID, SMH_LIBRARY_SECRET, SMH_USER_ID\n' +
        '可参考 .env.example'
    );
  }

  return { basePath, libraryId, spaceId, librarySecret, userId };
}

async function createIntegrationAccessToken(baseConfig: IntegrationBaseConfig): Promise<string> {
  const grant = (process.env.SMH_TOKEN_GRANT as CreateTokenGrantEnum | undefined) || CreateTokenGrantEnum.Admin;
  const periodRaw = Number(process.env.SMH_TOKEN_PERIOD || 3600);
  const period = Number.isFinite(periodRaw) && periodRaw > 0 ? Math.floor(periodRaw) : 3600;

  const tokenClient = new SMHClient({
    basePath: baseConfig.basePath,
    timeout: 30000,
  });

  const res = await tokenClient.token.createToken({
    libraryId: baseConfig.libraryId,
    librarySecret: baseConfig.librarySecret,
    spaceId: baseConfig.spaceId,
    userId: baseConfig.userId,
    grant,
    period,
  });

  const accessToken = res.data?.accessToken;
  if (!accessToken) {
    throw new Error('createToken 成功但响应中缺少 accessToken');
  }
  return accessToken;
}

/**
 * 获取集成测试配置（优先使用环境变量中的 accessToken，否则动态签发并缓存）
 */
export async function getConfig(): Promise<IntegrationConfig> {
  if (!cachedConfigPromise) {
    cachedConfigPromise = (async () => {
      const baseConfig = getBaseConfig();
      // If SMH_ACCESS_TOKEN is provided, use it directly (skip token creation)
      const envToken = process.env.SMH_ACCESS_TOKEN;
      const accessToken = envToken || await createIntegrationAccessToken(baseConfig);
      return {
        basePath: baseConfig.basePath,
        libraryId: baseConfig.libraryId,
        spaceId: baseConfig.spaceId,
        accessToken,
      };
    })();
  }
  return cachedConfigPromise;
}

/**
 * 创建共享的 SMHClient 实例
 */
export async function createTestClient(config?: IntegrationConfig): Promise<SMHClient> {
  const cfg = config || await getConfig();
  return new SMHClient({
    basePath: cfg.basePath,
    libraryId: cfg.libraryId,
    spaceId: cfg.spaceId,
    accessToken: cfg.accessToken,
    timeout: 30000,
  });
}

/**
 * 兼容 Node 环境的 File 构造
 */
export function createMockFile(name: string, content: Buffer, type: string = 'application/octet-stream'): File {
  const blob = new Blob([content], { type });
  const FileCtor = (globalThis as any).File;
  if (typeof FileCtor === 'function') {
    return new FileCtor([blob], name, { type });
  }
  return Object.assign(blob, {
    name,
    lastModified: Date.now(),
  }) as unknown as File;
}

/**
 * 等待 uploader 到达终态（SUCCESS / RAPID_SUCCESS / ERROR / CANCELED）
 */
export function waitForUploadEnd(uploader: ReturnType<SMHClient['createUploadTask']>): Promise<TaskStatus> {
  return new Promise<TaskStatus>((resolve, reject) => {
    uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
      if (state === TaskStatus.SUCCESS || state === TaskStatus.RAPID_SUCCESS) {
        resolve(state);
      }
      if (state === TaskStatus.ERROR) {
        reject(new Error(`上传失败: ${(uploader as any).message || ''}`));
      }
      if (state === TaskStatus.CANCELED) {
        resolve(state);
      }
    });
  });
}

/**
 * 环境准备失败时中断当前用例，避免假通过
 */
export function assertSetupReady(setupFailed: boolean): void {
  if (setupFailed) {
    throw new Error('集成测试环境准备失败，请检查 token/权限/网络后重试');
  }
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
const TEST_RUN_ID = process.env.SMH_TEST_RUN_ID || `${process.pid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function getTestRootDir(): string {
  return `__sdk_test__/runs/${TEST_RUN_ID}`;
}

export function uniquePath(prefix: string, ext: string = '.txt'): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${getTestRootDir()}/${prefix}_${ts}_${rand}${ext}`;
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
    getBaseConfig();
    return false;
  } catch {
    return true;
  }
}
