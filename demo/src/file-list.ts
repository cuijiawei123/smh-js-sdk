import { type SMHClient } from 'smh-js-sdk'
import { logger } from './logger'
import { formatSize, formatDateTime, getFileIcon } from './utils'

export interface FileItem {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  modificationTime?: string
  isFavorite?: boolean
}

/** listDirectory 的排序/筛选/分页选项 */
export interface ListDirectoryOptions {
  /** 排序字段：name | modificationTime | size | creationTime | localCreationTime */
  orderBy?: 'name' | 'modificationTime' | 'size' | 'creationTime' | 'localCreationTime'
  /** 排序方向 */
  orderByType?: 'asc' | 'desc'
  /** 筛选：onlyDir 只返回文件夹，onlyFile 只返回文件 */
  filter?: 'onlyDir' | 'onlyFile'
  /** 设为 union 则文件和文件夹拉通排序，不传则文件夹在前、文件在后 */
  sortType?: 'union'
  /** 每页数量，默认 100，最大 100 */
  limit?: number
  /** 是否返回收藏状态 */
  withFavoriteStatus?: boolean
}

export class FileListManager {
  private currentPath: string = '/'
  private items: FileItem[] = []
  private nextMarker: string | undefined = undefined
  private hasMore: boolean = false
  private isLoadingMore: boolean = false
  private currentClient?: SMHClient
  private currentOptions: ListDirectoryOptions = {}
  private onNavigateCallback?: (path: string) => void
  private onSelectFileCallback?: (path: string, name: string) => void
  private onDeleteCallback?: (path: string, name: string, type: 'file' | 'dir') => void

  init(
    onNavigate: (path: string) => void,
    onSelectFile: (path: string, name: string) => void,
    onDelete?: (path: string, name: string, type: 'file' | 'dir') => void
  ): void {
    this.onNavigateCallback = onNavigate
    this.onSelectFileCallback = onSelectFile
    this.onDeleteCallback = onDelete
  }

  /**
   * 加载目录内容（首页）
   */
  async load(
    path: string,
    client: SMHClient,
    options: ListDirectoryOptions = {}
  ): Promise<void> {
    this.currentPath = path
    this.currentClient = client
    this.currentOptions = options
    this.items = []
    this.nextMarker = undefined
    this.hasMore = false

    const container = document.getElementById('fileListContainer')
    if (!container) return

    container.innerHTML = '<div class="empty-list"><span class="loading-spinner"></span>加载中...</div>'
    this.updateBreadcrumb(path)

    const apiPath = path === '/' ? '' : path.replace(/^\//, '')
    const limit = options.limit ?? 100

    try {
      const response = await client.directory.listDirectory({
        filePath: apiPath,
        byMarker: 1 as any,
        limit,
        orderBy: options.orderBy as any,
        orderByType: options.orderByType as any,
        filter: options.filter as any,
        sortType: options.sortType as any,
        withFavoriteStatus: options.withFavoriteStatus ? 1 as any : undefined,
      })

      const data = response.data
      this.nextMarker = (data.nextMarker as any)?.marker ?? data.nextMarker as unknown as string | undefined
      this.hasMore = !!this.nextMarker

      const contents = (data.contents || []) as Array<{
        name?: string; type?: string; size?: string | number;
        modificationTime?: string; isFavorite?: boolean
      }>

      if (contents.length === 0) {
        container.innerHTML = '<div class="empty-list">📂 该目录为空</div>'
        logger.log(`已加载目录: ${path} (空目录)`)
        return
      }

      this.items = this.mapContents(contents, path)
      this.render()
      logger.log(`已加载目录: ${path} (${contents.length} 项${this.hasMore ? '，有更多数据' : ''})`)
    } catch (e: any) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message || e?.message || '未知错误'
      container.innerHTML = `<div class="empty-list error-message">❌ 加载失败: ${status ? `HTTP ${status} - ` : ''}${msg}</div>`
      logger.log(`加载目录失败: ${msg}`, 'error')
    }
  }

  /**
   * 加载更多（基于 marker 翻页）
   */
  async loadMore(): Promise<void> {
    if (!this.hasMore || this.isLoadingMore || !this.currentClient || !this.nextMarker) return

    this.isLoadingMore = true
    this.updateLoadMoreButton(true)

    try {
      const apiPath = this.currentPath === '/' ? '' : this.currentPath.replace(/^\//, '')
      const options = this.currentOptions

      const response = await this.currentClient.directory.listDirectory({
        filePath: apiPath,
        byMarker: 1 as any,
        marker: this.nextMarker,
        limit: options.limit ?? 100,
        orderBy: options.orderBy as any,
        orderByType: options.orderByType as any,
        filter: options.filter as any,
        sortType: options.sortType as any,
        withFavoriteStatus: options.withFavoriteStatus ? 1 as any : undefined,
      })

      const data = response.data
      this.nextMarker = (data.nextMarker as any)?.marker ?? data.nextMarker as unknown as string | undefined
      this.hasMore = !!this.nextMarker

      const contents = (data.contents || []) as Array<{
        name?: string; type?: string; size?: string | number;
        modificationTime?: string; isFavorite?: boolean
      }>

      const newItems = this.mapContents(contents, this.currentPath)
      this.items.push(...newItems)

      this.render()
      logger.log(`加载更多: ${newItems.length} 项${this.hasMore ? '，还有更多' : '，已全部加载'}`)
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '未知错误'
      this.updateLoadMoreButton(false)
      logger.log(`加载更多失败: ${msg}`, 'error')
    } finally {
      this.isLoadingMore = false
    }
  }

  private mapContents(
    contents: Array<{ name?: string; type?: string; size?: string | number; modificationTime?: string; isFavorite?: boolean }>,
    path: string
  ): FileItem[] {
    return contents
      .filter(item => item.name && item.type)
      .map(item => ({
        name: item.name!,
        path: path === '/' ? '/' + item.name : path + '/' + item.name,
        type: item.type as 'file' | 'dir',
        size: typeof item.size === 'string' ? parseInt(item.size, 10) : item.size,
        modificationTime: item.modificationTime,
        isFavorite: item.isFavorite,
      }))
  }

  private render(): void {
    const container = document.getElementById('fileListContainer')
    if (!container) return

    const showFavorite = this.currentOptions.withFavoriteStatus

    let html = `
      <table class="file-table">
        <thead>
          <tr>
            <th style="width: ${showFavorite ? '45%' : '50%'}">文件名</th>
            ${showFavorite ? '<th style="width: 5%">收藏</th>' : ''}
            <th style="width: 15%">大小</th>
            <th style="width: 20%">修改时间</th>
            <th style="width: 15%">操作</th>
          </tr>
        </thead>
        <tbody>
    `

    this.items.forEach(item => {
      const isDir = item.type === 'dir'
      html += `
        <tr class="${isDir ? 'clickable' : ''}" data-path="${item.path}" data-type="${item.type}">
          <td>
            <div class="file-name">
              <span class="file-icon">${getFileIcon(item.type, item.name)}</span>
              <span class="file-name-text">${item.name}</span>
            </div>
          </td>
          ${showFavorite ? `<td class="file-favorite">${item.isFavorite ? '⭐' : ''}</td>` : ''}
          <td class="file-size">${isDir ? '-' : formatSize(item.size || 0)}</td>
          <td class="file-time">${formatDateTime(item.modificationTime || '')}</td>
          <td class="file-actions">
            ${isDir
              ? `<button class="file-action-btn open-btn" data-path="${item.path}">打开</button>`
              : `<button class="file-action-btn download" data-path="${item.path}" data-name="${item.name}">下载</button>`
            }
            <button class="file-action-btn delete-btn" data-path="${item.path}" data-name="${item.name}" data-type="${item.type}">删除</button>
          </td>
        </tr>
      `
    })

    html += '</tbody></table>'

    if (this.hasMore) {
      html += `<div class="load-more-container">
        <button class="load-more-btn" id="loadMoreBtn">加载更多</button>
      </div>`
    }

    container.innerHTML = html

    this.bindEvents()
  }

  private updateLoadMoreButton(loading: boolean): void {
    const btn = document.getElementById('loadMoreBtn')
    if (!btn) return
    btn.textContent = loading ? '加载中...' : '加载更多'
    ;(btn as HTMLButtonElement).disabled = loading
  }

  private bindEvents(): void {
    const container = document.getElementById('fileListContainer')
    if (!container) return

    // 目录行点击 - 进入目录
    container.querySelectorAll('tr.clickable').forEach(row => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.file-action-btn')) return
        const path = (row as HTMLElement).dataset.path
        if (path && this.onNavigateCallback) {
          this.onNavigateCallback(path)
        }
      })
    })

    // 打开按钮
    container.querySelectorAll('.open-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const path = (btn as HTMLElement).dataset.path
        if (path && this.onNavigateCallback) {
          this.onNavigateCallback(path)
        }
      })
    })

    // 下载按钮
    container.querySelectorAll('.file-action-btn.download').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const path = (btn as HTMLElement).dataset.path
        const name = (btn as HTMLElement).dataset.name
        if (path && name && this.onSelectFileCallback) {
          this.onSelectFileCallback(path, name)
        }
      })
    })

    // 删除按钮
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const path = (btn as HTMLElement).dataset.path
        const name = (btn as HTMLElement).dataset.name
        const type = (btn as HTMLElement).dataset.type as 'file' | 'dir'
        if (path && name && this.onDeleteCallback) {
          this.onDeleteCallback(path, name, type)
        }
      })
    })

    // 加载更多按钮
    const loadMoreBtn = document.getElementById('loadMoreBtn')
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMore()
      })
    }
  }

  private updateBreadcrumb(path: string): void {
    const breadcrumb = document.getElementById('breadcrumb')
    if (!breadcrumb) return

    const parts = path.split('/').filter(Boolean)

    let html = '<span class="breadcrumb-item" data-path="/">🏠 根目录</span>'
    let currentPath = ''

    parts.forEach(part => {
      currentPath += '/' + part
      html += `<span class="breadcrumb-separator">/</span>`
      html += `<span class="breadcrumb-item" data-path="${currentPath}">${part}</span>`
    })

    breadcrumb.innerHTML = html

    // 绑定面包屑点击事件
    breadcrumb.querySelectorAll('.breadcrumb-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetPath = (item as HTMLElement).dataset.path || '/'
        if (this.onNavigateCallback) {
          this.onNavigateCallback(targetPath)
        }
      })
    })
  }

  getCurrentPath(): string {
    return this.currentPath
  }
}

export const fileListManager = new FileListManager()
