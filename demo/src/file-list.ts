import { type SMHClient } from 'smh-js-sdk'
import { logger } from './logger'
import { formatSize, formatDateTime, getFileIcon } from './utils'

export interface FileItem {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  modificationTime?: string
}

export class FileListManager {
  private currentPath: string = '/'
  private items: FileItem[] = []
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

  async load(
    path: string,
    client: SMHClient
  ): Promise<void> {
    this.currentPath = path

    const container = document.getElementById('fileListContainer')
    if (!container) return

    container.innerHTML = '<div class="empty-list"><span class="loading-spinner"></span>加载中...</div>'
    this.updateBreadcrumb(path)

    const apiPath = path === '/' ? '' : path.replace(/^\//, '')

    const response = await client.directory.listDirectory({
      filePath: apiPath,
      limit: 100
    })

    const data = response.data
    const contents = (data.contents || []) as Array<{ name?: string; type?: string; size?: string | number; modificationTime?: string }>

    if (contents.length === 0) {
      container.innerHTML = '<div class="empty-list">📂 该目录为空</div>'
      logger.log(`已加载目录: ${path} (空目录)`)
      return
    }

    this.items = contents
      .filter(item => item.name && item.type)
      .map(item => ({
        name: item.name!,
        path: path === '/' ? '/' + item.name : path + '/' + item.name,
        type: item.type as 'file' | 'dir',
        size: typeof item.size === 'string' ? parseInt(item.size, 10) : item.size,
        modificationTime: item.modificationTime
      }))

    this.render()
    logger.log(`已加载目录: ${path} (${contents.length} 项)`)
  }

  private render(): void {
    const container = document.getElementById('fileListContainer')
    if (!container) return

    let html = `
      <table class="file-table">
        <thead>
          <tr>
            <th style="width: 50%">文件名</th>
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
    container.innerHTML = html

    this.bindEvents()
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
