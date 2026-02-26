import { Uploader, Configuration, type UploadCheckpoint } from 'smh-js-sdk'
import { logger } from './logger'
import { formatSize } from './utils'

export type UploadState = 
  | 'waiting' 
  | 'start' 
  | 'created' 
  | 'computing_hash' 
  | 'running' 
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
  libraryId: string
  spaceId: string
  filePath: string
  file: File
  accessToken: string
  userId?: string
  chunkSize: number
  parallel: number
  enableInstantUpload: boolean
  checkpoint?: UploadCheckpoint
  onStateChange: (state: UploadState, error?: Error) => void
  onProgress: (progress: UploadProgress) => void
  onPartComplete?: (partInfo: { part_number: number; chunk_size: number }) => void
}

class UploadManager {
  private uploader: Uploader | null = null
  private checkpoint: UploadCheckpoint | null = null
  private state: UploadState = 'waiting'

  async start(options: UploadOptions, configuration: Configuration): Promise<void> {
    this.uploader = new Uploader({
      libraryId: options.libraryId,
      spaceId: options.spaceId,
      filePath: options.filePath,
      file: options.file,
      accessToken: options.accessToken,
      userId: options.userId,
      chunkSize: options.chunkSize,
      parallel: options.parallel,
      enableInstantUpload: options.enableInstantUpload,
      checkpoint: options.checkpoint,
      
      onStateChange: (checkpoint, state, error) => {
        this.checkpoint = checkpoint
        this.state = state as UploadState
        options.onStateChange(this.state, error)
        
        const debugInfo = checkpoint ? ` [rapid_upload=${checkpoint.rapid_upload}]` : ''
        logger.log(`上传状态变更: ${state}${debugInfo}${error ? ' - ' + error.message : ''}`)
      },
      
      onProgress: (info) => {
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
    }, configuration)

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
  return ['start', 'created', 'computing_hash', 'running', 'confirming'].includes(state)
}

export function isUploadFinished(state: UploadState): boolean {
  return ['success', 'rapid_success', 'error', 'canceled'].includes(state)
}
