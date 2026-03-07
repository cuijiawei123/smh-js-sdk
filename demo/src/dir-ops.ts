import { createClient, validateConfig, type SDKConfig } from './config'
import { logger } from './logger'
import { showResult, stripLeadingSlash, formatJSON } from './utils'

export function initDirOps(getConfig: () => SDKConfig): void {
  const panel = document.getElementById('panel-dir-ops')!
  panel.innerHTML = `
    <div class="card">
      <h2>📁 目录操作</h2>

      <!-- 创建目录 -->
      <div class="api-section">
        <h3>创建目录 (createDirectory)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>目录路径</label>
            <input type="text" id="do-create-path" placeholder="如: 新文件夹/子文件夹">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="do-create-btn">创建目录</button>
        <div class="result-container" id="do-create-result"></div>
      </div>

      <!-- 目录详情 -->
      <div class="api-section">
        <h3>文件/目录详情 (infoFileOrDirectory)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>路径</label>
            <input type="text" id="do-info-path" placeholder="如: 文件夹">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="do-info-btn">查询详情</button>
        <div class="result-container" id="do-info-result"></div>
      </div>

      <!-- 复制目录 -->
      <div class="api-section">
        <h3>复制目录 (copyDirectory)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>源目录路径</label>
            <input type="text" id="do-copy-src" placeholder="如: 源文件夹">
          </div>
          <div class="form-group">
            <label>目标目录路径</label>
            <input type="text" id="do-copy-dest" placeholder="如: 目标文件夹">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="do-copy-btn">复制目录</button>
        <div class="result-container" id="do-copy-result"></div>
      </div>

      <!-- 移动/重命名目录 -->
      <div class="api-section">
        <h3>移动/重命名目录 (moveDirectory)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>源目录路径</label>
            <input type="text" id="do-move-src" placeholder="如: 旧名称">
          </div>
          <div class="form-group">
            <label>目标目录路径</label>
            <input type="text" id="do-move-dest" placeholder="如: 新名称">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="do-move-btn">移动目录</button>
        <div class="result-container" id="do-move-result"></div>
      </div>

      <!-- 检查目录状态 -->
      <div class="api-section">
        <h3>检查目录状态 (checkDirectoryStatus)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>目录路径</label>
            <input type="text" id="do-status-path" placeholder="如: 文件夹">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="do-status-btn">检查状态</button>
        <div class="result-container" id="do-status-result"></div>
      </div>

      <!-- 分页列表 -->
      <div class="api-section">
        <h3>分页列出目录 (listDirectoryByPage)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>目录路径</label>
            <input type="text" id="do-page-path" placeholder="如: 文件夹 (留空为根目录)">
          </div>
          <div class="form-group">
            <label>页码</label>
            <input type="number" id="do-page-num" value="1" min="1">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>每页数量</label>
            <input type="number" id="do-page-limit" value="20" min="1" max="100">
          </div>
          <div class="form-group">
            <label>排序字段</label>
            <select id="do-page-orderby">
              <option value="name">名称</option>
              <option value="modificationTime">修改时间</option>
              <option value="size">大小</option>
              <option value="creationTime">创建时间</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="do-page-btn">查询</button>
        <div class="result-container" id="do-page-result"></div>
      </div>

      <!-- 更新目录标签 -->
      <div class="api-section">
        <h3>更新目录标签 (updateDirectoryLabels)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>目录路径</label>
            <input type="text" id="do-dlabel-path" placeholder="如: 文件夹">
          </div>
          <div class="form-group">
            <label>标签 (JSON 数组)</label>
            <input type="text" id="do-dlabel-labels" placeholder='如: [1, 2, 3]'>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="do-dlabel-btn">更新标签</button>
        <div class="result-container" id="do-dlabel-result"></div>
      </div>

      <!-- 更新文件标签 -->
      <div class="api-section">
        <h3>更新文件标签 (updateFileLabels)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>文件路径</label>
            <input type="text" id="do-flabel-path" placeholder="如: 文件夹/文件.txt">
          </div>
          <div class="form-group">
            <label>标签 (JSON 数组)</label>
            <input type="text" id="do-flabel-labels" placeholder='如: [1, 2, 3]'>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="do-flabel-btn">更新标签</button>
        <div class="result-container" id="do-flabel-result"></div>
      </div>
    </div>
  `

  const bind = (id: string, fn: () => void) => document.getElementById(id)?.addEventListener('click', fn)
  const getClient = () => {
    const c = getConfig(); const e = validateConfig(c); if (e) { logger.log(e, 'error'); return null }; return createClient(c)
  }

  bind('do-create-btn', async () => {
    const client = getClient(); if (!client) return
    const p = (document.getElementById('do-create-path') as HTMLInputElement).value.trim()
    if (!p) { logger.log('请填写目录路径', 'error'); return }
    try {
      const res = await client.directory.createDirectory({ filePath: stripLeadingSlash(p) })
      showResult('do-create-result', res.data); logger.log(`目录创建成功: ${p}`)
    } catch (e: any) { showResult('do-create-result', e.message || e, true); logger.log(`创建失败: ${e.message}`, 'error') }
  })

  bind('do-info-btn', async () => {
    const client = getClient(); if (!client) return
    const p = (document.getElementById('do-info-path') as HTMLInputElement).value.trim()
    if (!p) { logger.log('请填写路径', 'error'); return }
    try {
      const res = await client.directory.infoFileOrDirectory({ filePath: stripLeadingSlash(p), info: 1 } as any)
      showResult('do-info-result', res.data); logger.log(`详情查询成功: ${p}`)
    } catch (e: any) { showResult('do-info-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('do-copy-btn', async () => {
    const client = getClient(); if (!client) return
    const src = (document.getElementById('do-copy-src') as HTMLInputElement).value.trim()
    const dest = (document.getElementById('do-copy-dest') as HTMLInputElement).value.trim()
    if (!src || !dest) { logger.log('请填写源路径和目标路径', 'error'); return }
    try {
      const res = await client.directory.copyDirectory({ filePath: stripLeadingSlash(dest), copyDirectoryRequest: { copyFrom: stripLeadingSlash(src) } } as any)
      showResult('do-copy-result', res.data); logger.log(`目录复制成功: ${src} -> ${dest}`)
    } catch (e: any) { showResult('do-copy-result', e.message || e, true); logger.log(`复制失败: ${e.message}`, 'error') }
  })

  bind('do-move-btn', async () => {
    const client = getClient(); if (!client) return
    const src = (document.getElementById('do-move-src') as HTMLInputElement).value.trim()
    const dest = (document.getElementById('do-move-dest') as HTMLInputElement).value.trim()
    if (!src || !dest) { logger.log('请填写源路径和目标路径', 'error'); return }
    try {
      const res = await client.directory.moveDirectory({ filePath: stripLeadingSlash(dest), moveDirectoryRequest: { from: stripLeadingSlash(src) } } as any)
      showResult('do-move-result', res.data); logger.log(`目录移动成功: ${src} -> ${dest}`)
    } catch (e: any) { showResult('do-move-result', e.message || e, true); logger.log(`移动失败: ${e.message}`, 'error') }
  })

  bind('do-status-btn', async () => {
    const client = getClient(); if (!client) return
    const p = (document.getElementById('do-status-path') as HTMLInputElement).value.trim()
    if (!p) { logger.log('请填写目录路径', 'error'); return }
    try {
      const res = await client.directory.checkDirectoryStatus({ filePath: stripLeadingSlash(p) })
      showResult('do-status-result', res.data); logger.log(`目录状态: ${formatJSON(res.data)}`)
    } catch (e: any) { showResult('do-status-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('do-page-btn', async () => {
    const client = getClient(); if (!client) return
    const p = (document.getElementById('do-page-path') as HTMLInputElement).value.trim()
    const page = parseInt((document.getElementById('do-page-num') as HTMLInputElement).value) || 1
    const limit = parseInt((document.getElementById('do-page-limit') as HTMLInputElement).value) || 20
    const orderBy = (document.getElementById('do-page-orderby') as HTMLSelectElement).value
    try {
      const res = await client.directory.listDirectoryByPage({
        filePath: stripLeadingSlash(p),
        byPage: 1, page, pageSize: limit, orderBy: orderBy as any
      } as any)
      showResult('do-page-result', res.data); logger.log(`分页列表查询成功: 第${page}页`)
    } catch (e: any) { showResult('do-page-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('do-dlabel-btn', async () => {
    const client = getClient(); if (!client) return
    const p = (document.getElementById('do-dlabel-path') as HTMLInputElement).value.trim()
    const labels = (document.getElementById('do-dlabel-labels') as HTMLInputElement).value.trim()
    if (!p) { logger.log('请填写目录路径', 'error'); return }
    try {
      const labelIds = JSON.parse(labels || '[]')
      const res = await client.directory.updateDirectoryLabels({ filePath: stripLeadingSlash(p), update: 1, updateDirectoryLabelsRequest: { labelIds } } as any)
      showResult('do-dlabel-result', res.data); logger.log(`目录标签更新成功: ${p}`)
    } catch (e: any) { showResult('do-dlabel-result', e.message || e, true); logger.log(`更新失败: ${e.message}`, 'error') }
  })

  bind('do-flabel-btn', async () => {
    const client = getClient(); if (!client) return
    const p = (document.getElementById('do-flabel-path') as HTMLInputElement).value.trim()
    const labels = (document.getElementById('do-flabel-labels') as HTMLInputElement).value.trim()
    if (!p) { logger.log('请填写文件路径', 'error'); return }
    try {
      const labelIds = JSON.parse(labels || '[]')
      const res = await client.directory.updateFileLabels({ filePath: stripLeadingSlash(p), update: 1, updateFileLabelsRequest: { labelIds } } as any)
      showResult('do-flabel-result', res.data); logger.log(`文件标签更新成功: ${p}`)
    } catch (e: any) { showResult('do-flabel-result', e.message || e, true); logger.log(`更新失败: ${e.message}`, 'error') }
  })
}
