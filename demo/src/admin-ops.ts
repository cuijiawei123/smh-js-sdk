import { createClient, validateConfig, type SDKConfig } from './config'
import { logger } from './logger'
import { showResult } from './utils'

export function initAdminOps(getConfig: () => SDKConfig): void {
  const panel = document.getElementById('panel-admin')!
  panel.innerHTML = buildHTML()
  bindEvents(getConfig)
}

function buildHTML(): string {
  return `
    <div class="card">
      <h2>🔧 管理功能</h2>

      <div class="api-section">
        <h3>创建访问令牌 (createToken)</h3>
        <div class="form-row">
          <div class="form-group"><label>Library ID *</label><input type="text" id="adm-tc-libid" placeholder="媒体库 ID"></div>
          <div class="form-group"><label>Library Secret *</label><input type="text" id="adm-tc-secret" placeholder="媒体库密钥"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Space ID (可选)</label><input type="text" id="adm-tc-space" placeholder="空间 ID，多个逗号分隔"></div>
          <div class="form-group"><label>User ID (可选)</label><input type="text" id="adm-tc-uid" placeholder="用户 ID"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>有效期 (秒)</label><input type="number" id="adm-tc-ttl" value="86400" min="1"></div>
          <div class="form-group"><label>权限 (grant)</label><select id="adm-tc-grant"><option value="">默认(只读)</option><option value="read_write">读写</option><option value="admin">管理员</option></select></div>
        </div>
        <button class="btn btn-primary btn-sm" id="adm-tc-btn">创建 Token</button>
        <div class="result-container" id="adm-tc-result"></div>
      </div>

      <div class="api-section">
        <h3>续期令牌 (renewToken)</h3>
        <div class="form-group"><label>Access Token (留空使用当前配置)</label><input type="text" id="adm-tr-token" placeholder="要续期的 Token"></div>
        <button class="btn btn-primary btn-sm" id="adm-tr-btn">续期 Token</button>
        <div class="result-container" id="adm-tr-result"></div>
      </div>

      <div class="api-section">
        <h3>删除令牌 (deleteToken)</h3>
        <div class="form-group"><label>Access Token (留空使用当前配置)</label><input type="text" id="adm-td-token" placeholder="要删除的 Token"></div>
        <button class="btn btn-danger btn-sm" id="adm-td-btn">删除 Token</button>
        <div class="result-container" id="adm-td-result"></div>
      </div>

      <div class="api-section">
        <h3>删除用户所有令牌 (deleteUserTokens)</h3>
        <div class="form-row">
          <div class="form-group"><label>Library Secret</label><input type="text" id="adm-tdu-secret" placeholder="媒体库密钥"></div>
          <div class="form-group"><label>User ID (可选)</label><input type="text" id="adm-tdu-uid" placeholder="用户 ID"></div>
        </div>
        <button class="btn btn-danger btn-sm" id="adm-tdu-btn">删除用户所有 Token</button>
        <div class="result-container" id="adm-tdu-result"></div>
      </div>

      <div class="api-section">
        <h3>查询配额 (getQuota)</h3>
        <button class="btn btn-primary btn-sm" id="adm-qg-btn">查询配额</button>
        <div class="result-container" id="adm-qg-result"></div>
      </div>

      <div class="api-section">
        <h3>创建配额 (createQuota)</h3>
        <div class="form-row">
          <div class="form-group"><label>空间 ID 列表（逗号分隔）</label><input type="text" id="adm-qc-spaces" placeholder="如: spaceXxx,spaceYyy（多租户必填，单租户留空）"></div>
          <div class="form-group"><label>配额大小 (bytes)</label><input type="text" id="adm-qc-size" value="1073741824" placeholder="容量"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>是否删除超额文件</label><select id="adm-qc-removeWhenExceed"><option value="false">否</option><option value="true">是</option></select></div>
          <div class="form-group"><label>超额后等待天数</label><input type="number" id="adm-qc-removeAfterDays" value="7" placeholder="天数"></div>
        </div>
        <button class="btn btn-primary btn-sm" id="adm-qc-btn">创建配额</button>
        <div class="result-container" id="adm-qc-result"></div>
      </div>

      <div class="api-section">
        <h3>修改配额 (updateQuota)</h3>
        <div class="form-row">
          <div class="form-group"><label>配额大小 (bytes)</label><input type="text" id="adm-qu-size" value="1073741824" placeholder="容量"></div>
        </div>
        <button class="btn btn-primary btn-sm" id="adm-qu-btn">修改配额</button>
        <div class="result-container" id="adm-qu-result"></div>
      </div>

      <div class="api-section">
        <h3>查询异步任务 (queryTask)</h3>
        <div class="form-group"><label>任务 ID 列表（逗号分隔）</label><input type="text" id="adm-task-ids" placeholder="如: 10,12,13"></div>
        <button class="btn btn-primary btn-sm" id="adm-task-btn">查询任务</button>
        <div class="result-container" id="adm-task-result"></div>
      </div>

      <div class="api-section">
        <h3>查询媒体库任务 (queryLibraryTask)</h3>
        <div class="form-group"><label>任务 ID 列表（逗号分隔）</label><input type="text" id="adm-ltask-ids" placeholder="如: 10,12,13"></div>
        <button class="btn btn-primary btn-sm" id="adm-ltask-btn">查询任务</button>
        <div class="result-container" id="adm-ltask-result"></div>
      </div>

      <div class="api-section">
        <h3>空间用量统计 (getUsage)</h3>
        <div class="form-group"><label>Space IDs（逗号分隔）</label><input type="text" id="adm-usage-spaceids" placeholder="如: space1,space2"></div>
        <button class="btn btn-primary btn-sm" id="adm-usage-btn">查询空间用量</button>
        <div class="result-container" id="adm-usage-result"></div>
      </div>

      <div class="api-section">
        <h3>媒体库用量统计 (getLibraryUsage)</h3>
        <button class="btn btn-primary btn-sm" id="adm-libusage-btn">查询媒体库用量</button>
        <div class="result-container" id="adm-libusage-result"></div>
      </div>

      <div class="api-section">
        <h3>最近使用文件 (listRecentlyUsedFile)</h3>
        <div class="form-group"><label>数量限制</label><input type="number" id="adm-recent-limit" value="20" min="1" max="100"></div>
        <button class="btn btn-primary btn-sm" id="adm-recent-btn">查询最近使用</button>
        <div class="result-container" id="adm-recent-result"></div>
      </div>
    </div>
  `
}

function bindEvents(getConfig: () => SDKConfig): void {
  const getClient = () => {
    const c = getConfig(); const e = validateConfig(c)
    if (e) { logger.log(e, 'error'); return null }
    return createClient(c)
  }
  const bind = (id: string, fn: () => void) => document.getElementById(id)?.addEventListener('click', fn)

  bind('adm-tc-btn', async () => {
    const client = getClient(); if (!client) return
    const libraryId = (document.getElementById('adm-tc-libid') as HTMLInputElement).value.trim()
    const librarySecret = (document.getElementById('adm-tc-secret') as HTMLInputElement).value.trim()
    if (!libraryId) { logger.log('请填写 Library ID', 'error'); return }
    if (!librarySecret) { logger.log('请填写 Library Secret', 'error'); return }
    const userId = (document.getElementById('adm-tc-uid') as HTMLInputElement).value.trim() || undefined
    const spaceId = (document.getElementById('adm-tc-space') as HTMLInputElement).value.trim() || undefined
    const period = parseInt((document.getElementById('adm-tc-ttl') as HTMLInputElement).value) || 86400
    const grant = (document.getElementById('adm-tc-grant') as HTMLSelectElement).value || undefined
    try {
      const res = await client.token.createToken({ libraryId, librarySecret, userId, spaceId, period, grant } as any)
      showResult('adm-tc-result', res.data); logger.log('Token 创建成功')
    } catch (e: any) { showResult('adm-tc-result', e.message || e, true); logger.log(`创建失败: ${e.message}`, 'error') }
  })

  bind('adm-tr-btn', async () => {
    const config = getConfig()
    const client = getClient(); if (!client) return
    try {
      const res = await client.token.renewToken({ libraryId: config.libraryId } as any)
      showResult('adm-tr-result', res.data); logger.log('Token 续期成功')
    } catch (e: any) { showResult('adm-tr-result', e.message || e, true); logger.log(`续期失败: ${e.message}`, 'error') }
  })

  bind('adm-td-btn', async () => {
    const client = getClient(); if (!client) return
    try {
      const res = await client.token.deleteToken({} as any)
      showResult('adm-td-result', res.data || `删除成功 (HTTP ${res.status})`); logger.log('Token 已删除')
    } catch (e: any) { showResult('adm-td-result', e.message || e, true); logger.log(`删除失败: ${e.message}`, 'error') }
  })

  bind('adm-tdu-btn', async () => {
    const client = getClient(); if (!client) return
    const librarySecret = (document.getElementById('adm-tdu-secret') as HTMLInputElement).value.trim()
    if (!librarySecret) { logger.log('请填写 Library Secret', 'error'); return }
    const userId = (document.getElementById('adm-tdu-uid') as HTMLInputElement).value.trim() || undefined
    try {
      const res = await client.token.deleteUserTokens({ librarySecret, userId } as any)
      showResult('adm-tdu-result', res.data); logger.log('用户所有 Token 已删除')
    } catch (e: any) { showResult('adm-tdu-result', e.message || e, true); logger.log(`删除失败: ${e.message}`, 'error') }
  })

  bind('adm-qg-btn', async () => {
    const client = getClient(); if (!client) return
    try {
      const res = await client.quota.getQuota({} as any)
      showResult('adm-qg-result', res.data); logger.log('配额查询成功')
    } catch (e: any) { showResult('adm-qg-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('adm-qc-btn', async () => {
    const client = getClient(); if (!client) return
    const spacesStr = (document.getElementById('adm-qc-spaces') as HTMLInputElement).value.trim()
    const spaces = spacesStr ? spacesStr.split(',').map(s => s.trim()).filter(Boolean) : undefined
    const capacity = (document.getElementById('adm-qc-size') as HTMLInputElement).value.trim()
    const removeWhenExceed = (document.getElementById('adm-qc-removeWhenExceed') as HTMLSelectElement).value === 'true'
    const removeAfterDays = parseInt((document.getElementById('adm-qc-removeAfterDays') as HTMLInputElement).value) || 7
    try {
      const res = await client.quota.createQuota({ createQuotaRequest: { spaces, capacity, removeWhenExceed, removeAfterDays } } as any)
      showResult('adm-qc-result', res.data); logger.log('配额创建成功')
    } catch (e: any) { showResult('adm-qc-result', e.message || e, true); logger.log(`创建失败: ${e.message}`, 'error') }
  })

  bind('adm-qu-btn', async () => {
    const client = getClient(); if (!client) return
    const capacity = (document.getElementById('adm-qu-size') as HTMLInputElement).value.trim()
    try {
      const res = await client.quota.updateQuota({ updateQuotaRequest: { capacity } } as any)
      showResult('adm-qu-result', res.data || `修改成功 (HTTP ${res.status})`); logger.log('配额修改成功')
    } catch (e: any) { showResult('adm-qu-result', e.message || e, true); logger.log(`修改失败: ${e.message}`, 'error') }
  })

  bind('adm-task-btn', async () => {
    const client = getClient(); if (!client) return
    const taskIdList = (document.getElementById('adm-task-ids') as HTMLInputElement).value.trim()
    if (!taskIdList) { logger.log('请填写任务 ID', 'error'); return }
    try {
      const res = await client.task.queryTask({ taskIdList } as any)
      showResult('adm-task-result', res.data); logger.log('异步任务查询成功')
    } catch (e: any) { showResult('adm-task-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('adm-ltask-btn', async () => {
    const client = getClient(); if (!client) return
    const taskIdList = (document.getElementById('adm-ltask-ids') as HTMLInputElement).value.trim()
    if (!taskIdList) { logger.log('请填写任务 ID', 'error'); return }
    try {
      const res = await client.task.queryLibraryTask({ taskIdList } as any)
      showResult('adm-ltask-result', res.data); logger.log('媒体库任务查询成功')
    } catch (e: any) { showResult('adm-ltask-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('adm-usage-btn', async () => {
    const client = getClient(); if (!client) return
    const spaceIds = (document.getElementById('adm-usage-spaceids') as HTMLInputElement).value.trim()
    if (!spaceIds) { logger.log('请填写 Space IDs', 'error'); return }
    try {
      const res = await client.usage.getUsage({ spaceIds } as any)
      showResult('adm-usage-result', res.data); logger.log('空间用量查询成功')
    } catch (e: any) { showResult('adm-usage-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('adm-libusage-btn', async () => {
    const client = getClient(); if (!client) return
    try {
      const res = await client.usage.getLibraryUsage({} as any)
      showResult('adm-libusage-result', res.data); logger.log('媒体库用量查询成功')
    } catch (e: any) { showResult('adm-libusage-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('adm-recent-btn', async () => {
    const client = getClient(); if (!client) return
    const limit = parseInt((document.getElementById('adm-recent-limit') as HTMLInputElement).value) || 20
    try {
      const res = await client.recent.listRecentlyUsedFile({ listRecentlyUsedFileRequest: { limit } } as any)
      showResult('adm-recent-result', res.data); logger.log('最近使用文件查询成功')
    } catch (e: any) { showResult('adm-recent-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })
}
