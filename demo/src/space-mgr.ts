import { createClient, validateConfig, type SDKConfig } from './config'
import { DeleteSpaceForceEnum } from 'smh-js-sdk'
import { logger } from './logger'
import { showResult, stripLeadingSlash } from './utils'

export function initSpaceMgr(getConfig: () => SDKConfig): void {
  const panel = document.getElementById('panel-space')!
  panel.innerHTML = `
    <div class="card">
      <h2>🏢 空间管理</h2>

      <!-- 空间列表 -->
      <div class="api-section">
        <h3>空间列表 (listSpace)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>每页数量</label>
            <input type="number" id="sp-list-limit" value="20" min="1" max="100">
          </div>
          <div class="form-group">
            <label>Marker (可选)</label>
            <input type="text" id="sp-list-marker" placeholder="留空从头开始">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="sp-list-btn">查询空间列表</button>
        <div class="result-container" id="sp-list-result"></div>
      </div>

      <!-- 创建空间 -->
      <div class="api-section">
        <h3>创建空间 (createSpace)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>空间扩展属性 (JSON, 可选)</label>
            <input type="text" id="sp-create-ext" placeholder='如: {"key": "value"}'>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="sp-create-btn">创建空间</button>
        <div class="result-container" id="sp-create-result"></div>
      </div>

      <!-- 删除空间 -->
      <div class="api-section">
        <h3>删除空间 (deleteSpace)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Space ID</label>
            <input type="text" id="sp-delete-id" placeholder="要删除的空间 ID">
          </div>
          <div class="form-group">
            <label>强制删除</label>
            <select id="sp-delete-force">
              <option value="1">是（不判断是否为空）</option>
              <option value="0">否（非空不允许删除）</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Library Secret（为目标空间签发 Token）</label>
            <input type="text" id="sp-delete-secret" placeholder="必填，用于签发目标空间的 Token">
          </div>
          <div class="form-group">
            <label>User ID（可选）</label>
            <input type="text" id="sp-delete-uid" placeholder="用户 ID">
          </div>
        </div>
        <button class="btn btn-danger btn-sm" id="sp-delete-btn">删除空间</button>
        <div class="result-container" id="sp-delete-result"></div>
      </div>

      <!-- 空间内容视图 -->
      <div class="api-section">
        <h3>空间内容视图 (getContentsView)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>目录路径 (可选)</label>
            <input type="text" id="sp-view-path" placeholder="留空查看根目录">
          </div>
          <div class="form-group">
            <label>每页数量</label>
            <input type="number" id="sp-view-limit" value="20" min="1" max="100">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="sp-view-btn">查询内容</button>
        <div class="result-container" id="sp-view-result"></div>
      </div>

      <!-- 文件数量统计 -->
      <div class="api-section">
        <h3>文件数量统计 (getFileCountInSpace)</h3>
        <button class="btn btn-primary btn-sm" id="sp-count-btn">查询文件数量</button>
        <div class="result-container" id="sp-count-result"></div>
      </div>

      <!-- 空间数量统计 -->
      <div class="api-section">
        <h3>媒体库空间数量 (getLibrarySpaceCount)</h3>
        <button class="btn btn-primary btn-sm" id="sp-libcount-btn">查询空间数量</button>
        <div class="result-container" id="sp-libcount-result"></div>
      </div>

      <!-- 空间大小 -->
      <div class="api-section">
        <h3>空间大小 (getSpaceSize)</h3>
        <button class="btn btn-primary btn-sm" id="sp-size-btn">查询空间大小</button>
        <div class="result-container" id="sp-size-result"></div>
      </div>

      <!-- 空间扩展属性 -->
      <div class="api-section">
        <h3>查询空间扩展属性 (getSpaceExtension)</h3>
        <button class="btn btn-primary btn-sm" id="sp-getext-btn">查询扩展属性</button>
        <div class="result-container" id="sp-getext-result"></div>
      </div>

      <!-- 修改空间扩展属性 -->
      <div class="api-section">
        <h3>修改空间扩展属性 (updateSpaceExtension)</h3>
        <div class="form-group">
          <label>扩展属性 (JSON)</label>
          <textarea id="sp-setext-data" rows="3" placeholder='{"key": "value"}'></textarea>
        </div>
        <button class="btn btn-primary btn-sm" id="sp-setext-btn">修改属性</button>
        <div class="result-container" id="sp-setext-result"></div>
      </div>

      <!-- 限速设置 -->
      <div class="api-section">
        <h3>空间限速 (setSpaceTrafficLimit)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>上传限速 (bytes/s, 0 不限)</label>
            <input type="number" id="sp-limit-upload" value="0" min="0">
          </div>
          <div class="form-group">
            <label>下载限速 (bytes/s, 0 不限)</label>
            <input type="number" id="sp-limit-download" value="0" min="0">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="sp-limit-btn">设置限速</button>
        <div class="result-container" id="sp-limit-result"></div>
      </div>
    </div>
  `

  const getClient = () => {
    const c = getConfig(); const e = validateConfig(c); if (e) { logger.log(e, 'error'); return null }; return createClient(c)
  }
  const bind = (id: string, fn: () => void) => document.getElementById(id)?.addEventListener('click', fn)

  bind('sp-list-btn', async () => {
    const client = getClient(); if (!client) return
    const limit = parseInt((document.getElementById('sp-list-limit') as HTMLInputElement).value) || 20
    try {
      const res = await client.space.listSpace({ limit })
      showResult('sp-list-result', res.data); logger.log('空间列表查询成功')
    } catch (e: any) { showResult('sp-list-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('sp-create-btn', async () => {
    const client = getClient(); if (!client) return
    const ext = (document.getElementById('sp-create-ext') as HTMLInputElement).value.trim()
    try {
      const params: any = {}
      if (ext) params.extensions = JSON.parse(ext)
      const res = await client.space.createSpace(params)
      showResult('sp-create-result', res.data); logger.log('空间创建成功')
    } catch (e: any) { showResult('sp-create-result', e.message || e, true); logger.log(`创建失败: ${e.message}`, 'error') }
  })

  bind('sp-delete-btn', async () => {
    const config = getConfig()
    const client = getClient(); if (!client) return
    const spaceId = (document.getElementById('sp-delete-id') as HTMLInputElement).value.trim()
    const librarySecret = (document.getElementById('sp-delete-secret') as HTMLInputElement).value.trim()
    const userId = (document.getElementById('sp-delete-uid') as HTMLInputElement).value.trim() || config.userId || undefined
    const force = parseInt((document.getElementById('sp-delete-force') as HTMLSelectElement).value) as DeleteSpaceForceEnum
    if (!spaceId) { logger.log('请填写 Space ID', 'error'); return }
    if (!librarySecret) { logger.log('请填写 Library Secret（删除空间需要为目标空间签发 Token）', 'error'); return }
    if (!confirm(`确定要删除空间 ${spaceId} 吗？`)) return
    try {
      // 1. 为目标空间签发专属 accessToken
      logger.log(`正在为空间 ${spaceId} 签发 Token...`)
      const tokenRes = await client.token.createToken({
        libraryId: config.libraryId,
        librarySecret,
        spaceId,
        userId,
      } as any)
      const newToken = tokenRes.data?.accessToken
      if (!newToken) throw new Error('为目标空间签发 Token 失败')
      logger.log(`Token 签发成功，开始删除空间...`)

      // 2. 用新 token 删除空间
      const res = await client.space.deleteSpace({ spaceId, accessToken: newToken, force })
      showResult('sp-delete-result', res.data || `删除成功 (HTTP ${res.status})`); logger.log(`空间删除成功: ${spaceId}`)
    } catch (e: any) { showResult('sp-delete-result', e.message || e, true); logger.log(`删除失败: ${e.message}`, 'error') }
  })

  bind('sp-view-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('sp-view-path') as HTMLInputElement).value.trim()
    const limit = parseInt((document.getElementById('sp-view-limit') as HTMLInputElement).value) || 20
    try {
      const params: any = { limit }
      if (filePath) params.filePath = stripLeadingSlash(filePath)
      const res = await client.space.getContentsView(params)
      showResult('sp-view-result', res.data); logger.log('空间内容视图查询成功')
    } catch (e: any) { showResult('sp-view-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('sp-count-btn', async () => {
    const client = getClient(); if (!client) return
    try {
      const res = await client.space.getFileCountInSpace({})
      showResult('sp-count-result', res.data); logger.log('文件数量查询成功')
    } catch (e: any) { showResult('sp-count-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('sp-libcount-btn', async () => {
    const client = getClient(); if (!client) return
    try {
      const res = await client.space.getLibrarySpaceCount({})
      showResult('sp-libcount-result', res.data); logger.log('空间数量查询成功')
    } catch (e: any) { showResult('sp-libcount-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('sp-size-btn', async () => {
    const client = getClient(); if (!client) return
    try {
      const res = await client.space.getSpaceSize({})
      showResult('sp-size-result', res.data); logger.log('空间大小查询成功')
    } catch (e: any) { showResult('sp-size-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('sp-getext-btn', async () => {
    const client = getClient(); if (!client) return
    try {
      const res = await client.space.getSpaceExtension({})
      showResult('sp-getext-result', res.data); logger.log('空间扩展属性查询成功')
    } catch (e: any) { showResult('sp-getext-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('sp-setext-btn', async () => {
    const client = getClient(); if (!client) return
    const data = (document.getElementById('sp-setext-data') as HTMLTextAreaElement).value.trim()
    if (!data) { logger.log('请填写扩展属性', 'error'); return }
    try {
      const res = await client.space.updateSpaceExtension({ updateSpaceExtensionRequest: JSON.parse(data) } as any)
      showResult('sp-setext-result', res.data); logger.log('空间扩展属性修改成功')
    } catch (e: any) { showResult('sp-setext-result', e.message || e, true); logger.log(`修改失败: ${e.message}`, 'error') }
  })

  bind('sp-limit-btn', async () => {
    const client = getClient(); if (!client) return
    const uploadLimit = parseInt((document.getElementById('sp-limit-upload') as HTMLInputElement).value) || 0
    const downloadLimit = parseInt((document.getElementById('sp-limit-download') as HTMLInputElement).value) || 0
    try {
      const res = await client.space.setSpaceTrafficLimit({ setSpaceTrafficLimitRequest: { uploadTrafficLimit: uploadLimit, downloadTrafficLimit: downloadLimit } } as any)
      showResult('sp-limit-result', res.data); logger.log(`限速设置成功: 上传=${uploadLimit}, 下载=${downloadLimit}`)
    } catch (e: any) { showResult('sp-limit-result', e.message || e, true); logger.log(`设置失败: ${e.message}`, 'error') }
  })
}
