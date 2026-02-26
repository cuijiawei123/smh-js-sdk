import { Downloader, Configuration, type DownloadCheckpoint } from 'smh-js-sdk'
import { logger } from './logger'
import { formatSize } from './utils'

export type DownloadState = 
  | 'waiting' 
  | 'start' 
  | 'created' 
  | 'running' 
  | 'success' 
  | 'error' 
  | 'paused' 
  | 'canceled'

export interface DownloadProgress {
  progress: number
  speed: number
  leftTime: number
}

interface DownloadOptions {
  libraryId: string
  spaceId: string
  filePath: string
  fileName: string
  accessToken: string
  userId?: string
  chunkSize: number
  checkpoint?: DownloadCheckpoint
  onStateChange: (state: DownloadState, error?: Error) => void
  onProgress: (progress: DownloadProgress) => void
}

class DownloadManager {
  private downloader: Downloader | null = null
  private checkpoint: DownloadCheckpoint | null = null
  private state: DownloadState = 'waiting'

  async start(options: DownloadOptions, configuration: Configuration): Promise<Blob> {
    // 构造远程文件对象
    const remoteFile = {
      name: options.fileName,
      path: options.filePath
    }

    this.downloader = new Downloader(remoteFile, {
      libraryId: options.libraryId,
      spaceId: options.spaceId,
      filePath: options.filePath,
      accessToken: options.accessToken,
      userId: options.userId,
      chunkSize: options.chunkSize,
      checkpoint: options.checkpoint,
      
      onStateChange: (checkpoint, state, error) => {
        this.checkpoint = checkpoint
        this.state = state as DownloadState
        options.onStateChange(this.state, error)
        
        logger.log(`下载状态变更: ${state}${error ? ' - ' + error.message : ''}`)
      },
      
      onProgress: (info) => {
        options.onProgress({
          progress: info.progress,
          speed: info.speed,
          leftTime: info.leftTime
        })
      },
      
      verbose: true
    }, configuration)

    logger.log(`开始下载: ${options.filePath}`)
    const blob = await this.downloader.startAndGetBlob()
    
    logger.log(`下载完成: ${options.fileName} (${formatSize(blob.size)})`)
    return blob
  }

  async pause(): Promise<void> {
    if (this.downloader) {
      await this.downloader.pause()
      logger.log('下载已暂停', 'warn')
    }
  }

  async resume(): Promise<void> {
    if (this.downloader) {
      await this.downloader.start()
      logger.log('下载继续')
    }
  }

  async cancel(): Promise<void> {
    if (this.downloader) {
      await this.downloader.cancel()
      this.checkpoint = null
      logger.log('下载已取消', 'warn')
    }
  }

  getCheckpoint(): DownloadCheckpoint | null {
    return this.checkpoint
  }

  getState(): DownloadState {
    return this.state
  }
}

export const downloadManager = new DownloadManager()

export function isDownloadRunning(state: DownloadState): boolean {
  return ['start', 'created', 'running'].includes(state)
}

export function isDownloadFinished(state: DownloadState): boolean {
  return ['success', 'error', 'canceled'].includes(state)
}

export function saveBlobToFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
