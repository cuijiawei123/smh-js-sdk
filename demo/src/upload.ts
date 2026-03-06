import { type Uploader, type SMHClient, type UploadCheckpoint } from 'smh-js-sdk'
import { logger } from './logger'
import { formatSize } from './utils'

// 拦截 console.info（SDK 的 logInfo 用的是 console.info），将 SDK 内部日志转发到 demo 日志面板
const _origConsoleInfo = console.info
console.info = (...args: any[]) => {
  _origConsoleInfo.apply(console, args)
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
  // 只转发 SDK 的 [U] (Upload) 和 [D] (Download) 前缀日志
  if (msg.includes('[U]') || msg.includes('[D]')) {
    logger.log(`[SDK] ${msg}`)
  }
}

export type UploadState = 
  | 'waiting' 
  | 'start' 
  | 'created' 
  | 'computing_hash' 
  | 'running' 
  | 'complete'
  | 'confirming' 
  | 'success' 
  | 'rapid_success' 
  | 'error' 
  | 'paused' 
  | 'canceled'

export interface UploadProgress {
  progress: number
  speed: number
  leftTime: number
}

interface UploadOptions {
  filePath: string
  file: File
  userId?: string
  chunkSize: number
  parallel: number
  enableInstantUpload: boolean
  checkpoint?: UploadCheckpoint
  onStateChange: (state: UploadState, checkpoint: UploadCheckpoint | null, error?: Error) => void
  onProgress: (progress: UploadProgress) => void
  onPartComplete?: (partInfo: { part_number: number; chunk_size: number }) => void
}

class UploadManager {
  private uploader: Uploader | null = null
  private checkpoint: UploadCheckpoint | null = null
  private state: UploadState = 'waiting'

  async start(options: UploadOptions, client: SMHClient): Promise<void> {
    this.uploader = client.createUploadTask({
      filePath: options.filePath,
      file: options.file,
      userId: options.userId,
      chunkSize: options.chunkSize,
      parallel: options.parallel,
      enableInstantUpload: options.enableInstantUpload,
      checkpoint: options.checkpoint,
      
      onStateChange: (checkpoint, state, error) => {
        this.checkpoint = checkpoint
        this.state = state as UploadState
        options.onStateChange(this.state, checkpoint, error)
        
        const debugInfo = checkpoint 
          ? ` [rapid_upload=${checkpoint.rapid_upload}, loaded=${checkpoint.loaded}, progress=${checkpoint.progress?.toFixed(2)}%, size=${checkpoint.file?.size}]` 
          : ''
        logger.log(`上传状态变更: ${state}${debugInfo}${error ? ' - ' + error.message : ''}`)
      },
      
      onProgress: (info) => {
        logger.log(`上传进度: progress=${info.progress.toFixed(2)}%, loaded=${info.loaded}, total=${info.total}, speed=${info.speed}`)
        options.onProgress({
          progress: info.progress,
          speed: info.speed,
          leftTime: info.leftTime
        })
      },
      
      onPartComplete: (checkpoint, partInfo) => {
        this.checkpoint = checkpoint
        if (options.onPartComplete) {
          options.onPartComplete(partInfo)
        }
        logger.log(`分片 ${partInfo.part_number} 上传完成 (${formatSize(partInfo.chunk_size)})`)
      },
      
      verbose: true
    })

    logger.log(`开始上传: ${options.file.name} -> ${options.filePath}`)
    await this.uploader.start()
  }

  async pause(): Promise<void> {
    if (this.uploader) {
      await this.uploader.pause()
      logger.log('上传已暂停', 'warn')
    }
  }

  async resume(): Promise<void> {
    if (this.uploader) {
      await this.uploader.start()
      logger.log('上传继续')
    }
  }

  async cancel(): Promise<void> {
    if (this.uploader) {
      await this.uploader.cancel()
      this.checkpoint = null
      logger.log('上传已取消', 'warn')
    }
  }

  getCheckpoint(): UploadCheckpoint | null {
    return this.checkpoint
  }

  getState(): UploadState {
    return this.state
  }
}

export const uploadManager = new UploadManager()

export function isUploadRunning(state: UploadState): boolean {
  return ['start', 'created', 'computing_hash', 'running'].includes(state)
}

/** confirming/complete 状态：任务仍在进行中但不可暂停/取消 */
export function isUploadConfirming(state: UploadState): boolean {
  return ['confirming', 'complete'].includes(state)
}

export function isUploadFinished(state: UploadState): boolean {
  return ['success', 'rapid_success', 'error', 'canceled'].includes(state)
}
