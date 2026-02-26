export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatTime(seconds: number): string {
  if (!seconds || seconds === Infinity) return '--'
  if (seconds < 60) return Math.round(seconds) + '秒'
  if (seconds < 3600) return Math.round(seconds / 60) + '分钟'
  return Math.round(seconds / 3600) + '小时'
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getFileIcon(type: string, name: string): string {
  if (type === 'dir') return '📁'
  
  const ext = name.split('.').pop()?.toLowerCase() || ''
  
  const iconMap: Record<string, string> = {
    // 图片
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️', bmp: '🖼️', ico: '🖼️',
    // 视频
    mp4: '🎬', avi: '🎬', mov: '🎬', mkv: '🎬', wmv: '🎬', flv: '🎬', webm: '🎬',
    // 音频
    mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵', ogg: '🎵', m4a: '🎵', wma: '🎵',
    // 文档
    pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗', ppt: '📙', pptx: '📙',
    // 压缩包
    zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦', bz2: '📦',
    // 代码/文本
    txt: '📄', md: '📄', json: '📄', xml: '📄', yaml: '📄', yml: '📄',
    js: '📜', ts: '📜', py: '📜', java: '📜', html: '📜', css: '📜', scss: '📜',
    go: '📜', rs: '📜', cpp: '📜', c: '📜', h: '📜', php: '📜', rb: '📜',
    sql: '🗃️', sh: '⌨️', ps1: '⌨️', bat: '⌨️'
  }
  
  return iconMap[ext] || '📄'
}

export function getFileNameFromPath(path: string): string {
  return path.split('/').pop() || 'download'
}

export function getParentPath(path: string): string {
  if (path === '/' || path === '') return '/'
  const lastSlash = path.lastIndexOf('/')
  if (lastSlash <= 0) return '/'
  return path.substring(0, lastSlash) || '/'
}
