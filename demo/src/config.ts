import { Configuration } from 'smh-js-sdk'

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
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) }
    }
  } catch {
    // 忽略存储读取错误
  }
  return { ...defaultConfig }
}

export function saveConfig(config: SDKConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // 忽略存储写入错误
  }
}

export function createConfiguration(config: SDKConfig): Configuration {
  return new Configuration({
    basePath: config.basePath
  })
}

export function validateConfig(config: SDKConfig): string | null {
  if (!config.libraryId) return '请填写 Library ID'
  if (!config.spaceId) return '请填写 Space ID'
  if (!config.accessToken) return '请填写 Access Token'
  return null
}
