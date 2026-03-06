import './styles.css'
import { loadConfig, saveConfig, createClient, validateConfig, SDKConfig } from './config'
import { logger } from './logger'
import { uploadManager, UploadState, isUploadRunning, isUploadFinished, isUploadConfirming, UploadProgress } from './upload'
import type { UploadCheckpoint } from 'smh-js-sdk'
import { downloadManager, DownloadState, isDownloadRunning, isDownloadFinished, DownloadProgress, saveBlobToFile, downloadByUrl } from './download'
import { fileListManager } from './file-list'
import { formatSize, formatTime, getFileNameFromPath, getParentPath } from './utils'

// ===== State =====
let selectedFile: File | null = null

// ===== DOM Elements =====
const elements = {
  // Config
  libraryId: document.getElementById('libraryId') as HTMLInputElement,
  spaceId: document.getElementById('spaceId') as HTMLInputElement,
  accessToken: document.getElementById('accessToken') as HTMLInputElement,
  basePath: document.getElementById('basePath') as HTMLInputElement,
  userId: document.getElementById('userId') as HTMLInputElement,
  
  // Upload
  fileInput: document.getElementById('fileInput') as HTMLInputElement,
  fileLabel: document.getElementById('fileLabel') as HTMLLabelElement,
  fileWrapper: document.querySelector('.file-input-wrapper') as HTMLDivElement,
  uploadPath: document.getElementById('uploadPath') as HTMLInputElement,
  chunkSize: document.getElementById('chunkSize') as HTMLInputElement,
  parallel: document.getElementById('parallel') as HTMLInputElement,
  enableInstantUpload: document.getElementById('enableInstantUpload') as HTMLInputElement,
  startUploadBtn: document.getElementById('startUploadBtn') as HTMLButtonElement,
  pauseUploadBtn: document.getElementById('pauseUploadBtn') as HTMLButtonElement,
  resumeUploadBtn: document.getElementById('resumeUploadBtn') as HTMLButtonElement,
  cancelUploadBtn: document.getElementById('cancelUploadBtn') as HTMLButtonElement,
  uploadProgress: document.getElementById('uploadProgress') as HTMLDivElement,
  uploadStatus: document.getElementById('uploadStatus') as HTMLSpanElement,
  uploadProgressBar: document.getElementById('uploadProgressBar') as HTMLDivElement,
  uploadProgressText: document.getElementById('uploadProgressText') as HTMLSpanElement,
  uploadSpeedText: document.getElementById('uploadSpeedText') as HTMLSpanElement,
  uploadTimeText: document.getElementById('uploadTimeText') as HTMLSpanElement,
  
  // Download
  downloadPath: document.getElementById('downloadPath') as HTMLInputElement,
  downloadChunkSize: document.getElementById('downloadChunkSize') as HTMLInputElement,
  startDownloadBtn: document.getElementById('startDownloadBtn') as HTMLButtonElement,
  urlDownloadBtn: document.getElementById('urlDownloadBtn') as HTMLButtonElement,
  pauseDownloadBtn: document.getElementById('pauseDownloadBtn') as HTMLButtonElement,
  resumeDownloadBtn: document.getElementById('resumeDownloadBtn') as HTMLButtonElement,
  cancelDownloadBtn: document.getElementById('cancelDownloadBtn') as HTMLButtonElement,
  downloadProgress: document.getElementById('downloadProgress') as HTMLDivElement,
  downloadStatus: document.getElementById('downloadStatus') as HTMLSpanElement,
  downloadProgressBar: document.getElementById('downloadProgressBar') as HTMLDivElement,
  downloadProgressText: document.getElementById('downloadProgressText') as HTMLSpanElement,
  downloadSpeedText: document.getElementById('downloadSpeedText') as HTMLSpanElement,
  downloadTimeText: document.getElementById('downloadTimeText') as HTMLSpanElement,
  
  // File List
  listPath: document.getElementById('listPath') as HTMLInputElement,
  refreshListBtn: document.getElementById('refreshListBtn') as HTMLButtonElement,
  
  // Log
  clearLogBtn: document.getElementById('clearLogBtn') as HTMLButtonElement
}

// ===== Helper Functions =====
function getConfig(): SDKConfig {
  return {
    libraryId: elements.libraryId.value.trim(),
    spaceId: elements.spaceId.value.trim(),
    accessToken: elements.accessToken.value.trim(),
    basePath: elements.basePath.value.trim(),
    userId: elements.userId.value.trim() || undefined
  }
}

function updateUploadStatus(
  state: UploadState,
  checkpoint?: UploadCheckpoint | null,
  hashPhase?: 'beginning' | 'full'
): void {
  const statusMap: Record<UploadState, { class: string; text: string }> = {
    'waiting': { class: 'status-waiting', text: '等待中' },
    'start': { class: 'status-running', text: '启动中' },
    'created': { class: 'status-running', text: '已创建' },
    'computing_hash': { class: 'status-running', text: '计算哈希' },
    'running': { class: 'status-running', text: '传输中' },
    'complete': { class: 'status-running', text: '传输完成' },
    'confirming': { class: 'status-running', text: '确认中' },
    'success': { class: 'status-success', text: '成功' },
    'rapid_success': { class: 'status-success', text: '秒传成功' },
    'error': { class: 'status-error', text: '错误' },
    'paused': { class: 'status-paused', text: '已暂停' },
    'canceled': { class: 'status-error', text: '已取消' }
  }
  
  const info = statusMap[state]
  let text = info.text
  
  // 区分三次 computing_hash：
  // 1. created 前：计算 beginningHash（秒传匹配）
  // 2. created 后、无 upload_id：计算 fullHash（202 需要全文哈希确认秒传）
  // 3. created 后、有 upload_id：计算 CRC64（分片上传完成后校验）
  if (state === 'computing_hash') {
    if (checkpoint?.upload_id) {
      text = '校验 CRC64'
    } else if (hashPhase === 'full') {
      text = '计算完整哈希'
    } else {
      text = '计算秒传哈希'
    }
  }
  
  elements.uploadStatus.className = `status-badge ${info.class}`
  elements.uploadStatus.textContent = text
}

function updateDownloadStatus(state: DownloadState): void {
  const statusMap: Record<DownloadState, { class: string; text: string }> = {
    'waiting': { class: 'status-waiting', text: '等待中' },
    'start': { class: 'status-running', text: '启动中' },
    'created': { class: 'status-running', text: '已创建' },
    'running': { class: 'status-running', text: '传输中' },
    'success': { class: 'status-success', text: '成功' },
    'error': { class: 'status-error', text: '错误' },
    'paused': { class: 'status-paused', text: '已暂停' },
    'canceled': { class: 'status-error', text: '已取消' }
  }
  
  const info = statusMap[state]
  elements.downloadStatus.className = `status-badge ${info.class}`
  elements.downloadStatus.textContent = info.text
}

function updateUploadButtons(state: UploadState): void {
  const isRunning = isUploadRunning(state)
  const isConfirming = isUploadConfirming(state)
  const isPaused = state === 'paused'
  const isFinished = isUploadFinished(state)
  
  elements.startUploadBtn.disabled = isRunning || isConfirming
  elements.pauseUploadBtn.disabled = !isRunning
  elements.resumeUploadBtn.disabled = !isPaused
  elements.cancelUploadBtn.disabled = isFinished || isConfirming
}

function updateDownloadButtons(state: DownloadState): void {
  const isRunning = isDownloadRunning(state)
  const isPaused = state === 'paused'
  const isFinished = isDownloadFinished(state)
  
  elements.startDownloadBtn.disabled = isRunning
  elements.pauseDownloadBtn.disabled = !isRunning
  elements.resumeDownloadBtn.disabled = !isPaused
  elements.cancelDownloadBtn.disabled = isFinished
}

function updateUploadProgress(progress: UploadProgress): void {
  elements.uploadProgressBar.style.width = progress.progress + '%'
  elements.uploadProgressText.textContent = progress.progress.toFixed(2) + '%'
  elements.uploadSpeedText.textContent = formatSize(progress.speed) + '/s'
  elements.uploadTimeText.textContent = '剩余时间: ' + formatTime(progress.leftTime)
}

function finalizeUploadProgress(state: UploadState): void {
  if (state === 'success' || state === 'rapid_success') {
    // 不兜底设置进度，直接展示 SDK 返回的实际进度值
    elements.uploadProgressBar.classList.add('progress-bar-success')
    elements.uploadSpeedText.textContent = ''
    elements.uploadTimeText.textContent = state === 'rapid_success' ? '秒传完成' : '上传完成'
  } else if (state === 'error' || state === 'canceled') {
    elements.uploadProgressBar.classList.add('progress-bar-stopped')
    elements.uploadSpeedText.textContent = ''
    elements.uploadTimeText.textContent = state === 'error' ? '上传失败' : '已取消'
  } else if (state === 'paused') {
    elements.uploadProgressBar.classList.add('progress-bar-stopped')
    elements.uploadSpeedText.textContent = '0 B/s'
    elements.uploadTimeText.textContent = '已暂停'
  } else {
    elements.uploadProgressBar.classList.remove('progress-bar-success', 'progress-bar-stopped')
  }
}

function updateDownloadProgress(progress: DownloadProgress): void {
  elements.downloadProgressBar.style.width = progress.progress + '%'
  elements.downloadProgressText.textContent = progress.progress.toFixed(2) + '%'
  elements.downloadSpeedText.textContent = formatSize(progress.speed) + '/s'
  elements.downloadTimeText.textContent = '剩余时间: ' + formatTime(progress.leftTime)
}

function finalizeDownloadProgress(state: DownloadState): void {
  if (state === 'success') {
    // 不兜底设置进度，直接展示 SDK 返回的实际进度值
    elements.downloadProgressBar.classList.add('progress-bar-success')
    elements.downloadSpeedText.textContent = ''
    elements.downloadTimeText.textContent = '下载完成'
  } else if (state === 'error' || state === 'canceled') {
    elements.downloadProgressBar.classList.add('progress-bar-stopped')
    elements.downloadSpeedText.textContent = ''
    elements.downloadTimeText.textContent = state === 'error' ? '下载失败' : '已取消'
  } else if (state === 'paused') {
    elements.downloadProgressBar.classList.add('progress-bar-stopped')
    elements.downloadSpeedText.textContent = '0 B/s'
    elements.downloadTimeText.textContent = '已暂停'
  } else {
    elements.downloadProgressBar.classList.remove('progress-bar-success', 'progress-bar-stopped')
  }
}

// ===== Event Handlers =====
function handleFileSelect(file: File): void {
  selectedFile = file
  elements.fileLabel.textContent = `📄 ${file.name} (${formatSize(file.size)})`
  elements.fileLabel.classList.add('has-file')
  
  // 每次选择文件时，自动用文件名更新上传路径（保留已有目录前缀）
  const currentPath = elements.uploadPath.value.trim()
  if (!currentPath || currentPath === '/') {
    elements.uploadPath.value = '/' + file.name
  } else {
    const dir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1) || '/'
    elements.uploadPath.value = dir + file.name
  }
  
  logger.log(`已选择文件: ${file.name} (${formatSize(file.size)})`)
}

async function handleUpload(): Promise<void> {
  const config = getConfig()
  const error = validateConfig(config)
  if (error) {
    logger.log(error, 'error')
    return
  }
  
  if (!selectedFile) {
    logger.log('请先选择要上传的文件', 'error')
    return
  }
  
  const uploadPath = elements.uploadPath.value.trim()
  if (!uploadPath) {
    logger.log('请填写上传路径', 'error')
    return
  }
  
  saveConfig(config)
  
  const client = createClient(config)
  elements.uploadProgress.classList.add('active')
  
  try {
    // 追踪 computing_hash 阶段：'beginning'(首次) | 'full'(经历 created 后)
    let uploadHashPhase: 'beginning' | 'full' = 'beginning'
    
    await uploadManager.start({
      filePath: uploadPath,
      file: selectedFile,
      userId: config.userId,
      chunkSize: parseInt(elements.chunkSize.value) || 5,
      parallel: parseInt(elements.parallel.value) || 2,
      enableInstantUpload: elements.enableInstantUpload.checked,
        onStateChange: (state, checkpoint, _error) => {
        if (state === 'created') uploadHashPhase = 'full'
        updateUploadStatus(state, checkpoint, uploadHashPhase)
        updateUploadButtons(state)
        finalizeUploadProgress(state)
        
        if (isUploadFinished(state)) {
          if (state === 'success' || state === 'rapid_success') {
            const dirPath = getParentPath(uploadPath)
            setTimeout(() => loadFileList(dirPath), 500)
          }
        }
      },
      onProgress: updateUploadProgress
    }, client)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.log(`上传失败: ${message}`, 'error')
  }
}

async function handleDownload(): Promise<void> {
  const config = getConfig()
  const error = validateConfig(config)
  if (error) {
    logger.log(error, 'error')
    return
  }
  
  const downloadPath = elements.downloadPath.value.trim()
  if (!downloadPath) {
    logger.log('请填写下载文件路径', 'error')
    return
  }
  
  saveConfig(config)
  
  const client = createClient(config)
  elements.downloadProgress.classList.add('active')
  
  try {
    const fileName = getFileNameFromPath(downloadPath)
    
    const blob = await downloadManager.start({
      filePath: downloadPath,
      fileName: fileName,
      userId: config.userId,
      chunkSize: parseInt(elements.downloadChunkSize.value) || 5,
      onStateChange: (state, _error) => {
        updateDownloadStatus(state)
        updateDownloadButtons(state)
        finalizeDownloadProgress(state)
      },
      onProgress: updateDownloadProgress
    }, client)
    
    saveBlobToFile(blob, fileName)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.log(`下载失败: ${message}`, 'error')
  }
}

async function handleUrlDownload(): Promise<void> {
  const config = getConfig()
  const error = validateConfig(config)
  if (error) {
    logger.log(error, 'error')
    return
  }

  const downloadPath = elements.downloadPath.value.trim()
  if (!downloadPath) {
    logger.log('请填写下载文件路径', 'error')
    return
  }

  saveConfig(config)

  const client = createClient(config)
  const fileName = getFileNameFromPath(downloadPath)

  try {
    await downloadByUrl(client, downloadPath, fileName)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.log(`浏览器URL下载失败: ${message}`, 'error')
  }
}

async function loadFileList(path: string): Promise<void> {
  const config = getConfig()
  const error = validateConfig(config)
  if (error) {
    logger.log(error, 'error')
    return
  }
  
  const client = createClient(config)
  elements.listPath.value = path
  
  await fileListManager.load(path, client, {
    orderBy: 'name',
    orderByType: 'asc',
    withFavoriteStatus: true,
  })
}

function handleFileSelectFromList(path: string, _name: string): void {
  elements.downloadPath.value = path
  logger.log(`已选择下载文件: ${path}`)
  elements.downloadPath.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function handleDeleteFromList(path: string, name: string, type: 'file' | 'dir'): Promise<void> {
  const typeText = type === 'dir' ? '文件夹' : '文件'
  if (!confirm(`确定要删除${typeText} "${name}" 吗？`)) {
    return
  }

  const config = getConfig()
  const error = validateConfig(config)
  if (error) {
    logger.log(error, 'error')
    return
  }

  const client = createClient(config)
  const filePath = path.replace(/^\//, '')

  try {
    if (type === 'dir') {
      await client.directory.deleteDirectory({ filePath })
    } else {
      await client.file.deleteFile({ filePath })
    }
    logger.log(`已删除${typeText}: ${name}`)
    // 刷新当前目录
    await loadFileList(fileListManager.getCurrentPath())
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.log(`删除${typeText}失败: ${message}`, 'error')
  }
}

// ===== Initialization =====
function initConfig(): void {
  const config = loadConfig()
  elements.libraryId.value = config.libraryId
  elements.spaceId.value = config.spaceId
  elements.accessToken.value = config.accessToken
  elements.basePath.value = config.basePath
  elements.userId.value = config.userId || ''
  
  // 监听配置变化自动保存
  const configInputs = [elements.libraryId, elements.spaceId, elements.accessToken, elements.basePath, elements.userId]
  configInputs.forEach(input => {
    input.addEventListener('change', () => saveConfig(getConfig()))
  })
}

function initFileInput(): void {
  // 文件选择
  elements.fileInput.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  })
  
  // 拖拽支持
  elements.fileWrapper.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.stopPropagation()
    elements.fileWrapper.classList.add('dragover')
  })
  
  elements.fileWrapper.addEventListener('dragleave', (e) => {
    e.preventDefault()
    e.stopPropagation()
    elements.fileWrapper.classList.remove('dragover')
  })
  
  elements.fileWrapper.addEventListener('drop', (e) => {
    e.preventDefault()
    e.stopPropagation()
    elements.fileWrapper.classList.remove('dragover')
    const files = e.dataTransfer?.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  })
}

function initUpload(): void {
  elements.startUploadBtn.addEventListener('click', handleUpload)
  elements.pauseUploadBtn.addEventListener('click', () => uploadManager.pause())
  elements.resumeUploadBtn.addEventListener('click', () => uploadManager.resume())
  elements.cancelUploadBtn.addEventListener('click', () => uploadManager.cancel())
}

function initDownload(): void {
  elements.startDownloadBtn.addEventListener('click', handleDownload)
  elements.urlDownloadBtn.addEventListener('click', handleUrlDownload)
  elements.pauseDownloadBtn.addEventListener('click', () => downloadManager.pause())
  elements.resumeDownloadBtn.addEventListener('click', () => downloadManager.resume())
  elements.cancelDownloadBtn.addEventListener('click', () => downloadManager.cancel())
}

function initFileList(): void {
  fileListManager.init(
    (path) => loadFileList(path),
    (path, name) => handleFileSelectFromList(path, name),
    (path, name, type) => handleDeleteFromList(path, name, type)
  )
  
  elements.refreshListBtn.addEventListener('click', () => {
    const path = elements.listPath.value.trim() || '/'
    loadFileList(path)
  })
  
  elements.listPath.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const path = elements.listPath.value.trim() || '/'
      loadFileList(path)
    }
  })
}

function initLog(): void {
  logger.init('logContainer')
  elements.clearLogBtn.addEventListener('click', () => logger.clear())
}

// ===== Main =====
function main(): void {
  initConfig()
  initFileInput()
  initUpload()
  initDownload()
  initFileList()
  initLog()
  
  logger.log('SMH JS SDK Demo 已加载，请填写配置后开始测试')
}

main()
