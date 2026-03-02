import { SMHClient } from 'smh-js-sdk'

export interface SDKConfig {
  libraryId: string
  spaceId: string
  accessToken: string
  basePath: string
  userId?: string
}

const STORAGE_KEY = 'smh_sdk_demo_config'

const defaultConfig: SDKConfig = {
  libraryId: 'smh08gcw6500e6jl',
  spaceId: 'space25ajndjtefgrh',
  accessToken: 'acctk021d0e7b53ml92pnlcqzrxhwbcv29etf33xxyfu4juc232acywyllkm9cz5b9l6a7k6jxepyat3sw72h9cpnbw93m9lrpglhhybzycpps6t2lyy2m5x0c118548',
  basePath: 'https://api-v2.test1.tencentsmh.cn',
  userId: 'test-user'
}

export function loadConfig(): SDKConfig {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return { ...defaultConfig, ...JSON.parse(stored) }
  }
  return { ...defaultConfig }
}

export function saveConfig(config: SDKConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function createClient(config: SDKConfig): SMHClient {
  return new SMHClient({
    basePath: config.basePath,
    libraryId: config.libraryId,
    spaceId: config.spaceId,
    accessToken: config.accessToken,
  })
}

export function validateConfig(config: SDKConfig): string | null {
  if (!config.libraryId) return '请填写 Library ID'
  if (!config.spaceId) return '请填写 Space ID'
  if (!config.accessToken) return '请填写 Access Token'
  return null
}
