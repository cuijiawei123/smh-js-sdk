export type LogType = 'info' | 'warn' | 'error'

export interface LogEntry {
  time: string
  message: string
  type: LogType
}

const MAX_LOG_ENTRIES = 200

class Logger {
  private container: HTMLElement | null = null
  private entries: LogEntry[] = []

  init(containerId: string): void {
    this.container = document.getElementById(containerId)
    this.render()
  }

  log(message: string, type: LogType = 'info'): void {
    const entry: LogEntry = {
      time: new Date().toTimeString().split(' ')[0],
      message,
      type
    }
    
    this.entries.push(entry)
    
    // 限制日志条目数
    if (this.entries.length > MAX_LOG_ENTRIES) {
      this.entries = this.entries.slice(-MAX_LOG_ENTRIES)
    }
    
    this.render()
    this.scrollToBottom()
  }

  clear(): void {
    this.entries = []
    this.render()
  }

  private render(): void {
    if (!this.container) return

    if (this.entries.length === 0) {
      this.container.innerHTML = `
        <div class="log-entry">
          <span class="log-time">[--:--:--]</span>
          <span class="log-info">等待操作...</span>
        </div>
      `
      return
    }

    this.container.innerHTML = this.entries.map(entry => `
      <div class="log-entry">
        <span class="log-time">[${entry.time}]</span>
        <span class="log-${entry.type}">${this.escapeHtml(entry.message)}</span>
      </div>
    `).join('')
  }

  private scrollToBottom(): void {
    if (this.container) {
      this.container.scrollTop = this.container.scrollHeight
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

export const logger = new Logger()
