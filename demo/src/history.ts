import { createClient, validateConfig, type SDKConfig } from './config'
import { logger } from './logger'
import { showResult, stripLeadingSlash } from './utils'

export function initHistory(getConfig: () => SDKConfig): void {
  const panel = document.getElementById('panel-history')!
  panel.innerHTML = `
    <div class="card">
      <h2>📜 历史版本</h2>

      <div class="api-section">
        <h3>历史版本列表 (listHistory)</h3>
        <div class="form-row">
          <div class="form-group"><label>文件路径</label><input type="text" id="hist-list-path" placeholder="如: 文件夹/文件.txt"></div>
          <div class="form-group"><label>每页数量</label><input type="number" id="hist-list-limit" value="20" min="1" max="100"></div>
        </div>
        <div class="form-group"><label>Marker (翻页标记)</label><input type="text" id="hist-list-marker" placeholder="留空加载首页"></div>
        <button class="btn btn-primary btn-sm" id="hist-list-btn">查询列表</button>
        <div class="result-container" id="hist-list-result"></div>
      </div>

      <div class="api-section">
        <h3>恢复为最新版本 (setHistoryLatest)</h3>
        <div class="form-row">
          <div class="form-group"><label>历史版本 ID</label><input type="text" id="hist-latest-id" placeholder="historyId (字符串)"></div>
        </div>
        <button class="btn btn-success btn-sm" id="hist-latest-btn">恢复为最新</button>
        <div class="result-container" id="hist-latest-result"></div>
      </div>

      <div class="api-section">
        <h3>删除历史版本 (deleteHistory)</h3>
        <div class="form-group"><label>历史版本 ID 列表（每行一个）</label><textarea id="hist-del-ids" rows="3" placeholder="historyId1&#10;historyId2"></textarea></div>
        <button class="btn btn-danger btn-sm" id="hist-del-btn">删除版本</button>
        <div class="result-container" id="hist-del-result"></div>
      </div>

      <div class="api-section">
        <h3>清空历史版本 (emptyHistory)</h3>
        <button class="btn btn-danger btn-sm" id="hist-empty-btn">清空历史</button>
        <div class="result-container" id="hist-empty-result"></div>
      </div>

      <div class="api-section">
        <h3>查询历史版本配置 (getHistoryConfig)</h3>
        <button class="btn btn-primary btn-sm" id="hist-getconfig-btn">查询配置</button>
        <div class="result-container" id="hist-getconfig-result"></div>
      </div>

      <div class="api-section">
        <h3>设置历史版本配置 (setHistoryConfig)</h3>
        <div class="form-row">
          <div class="form-group"><label>是否开启</label><select id="hist-setconfig-enabled"><option value="true">开启</option><option value="false">关闭</option></select></div>
          <div class="form-group"><label>最大版本数量</label><input type="number" id="hist-setconfig-count" value="20" min="1"></div>
        </div>
        <button class="btn btn-primary btn-sm" id="hist-setconfig-btn">保存配置</button>
        <div class="result-container" id="hist-setconfig-result"></div>
      </div>
    </div>
  `

  const getClient = () => {
    const c = getConfig(); const e = validateConfig(c); if (e) { logger.log(e, 'error'); return null }; return createClient(c)
  }
  const bind = (id: string, fn: () => void) => document.getElementById(id)?.addEventListener('click', fn)

  bind('hist-list-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('hist-list-path') as HTMLInputElement).value.trim()
    if (!filePath) { logger.log('请填写文件路径', 'error'); return }
    const limit = parseInt((document.getElementById('hist-list-limit') as HTMLInputElement).value) || 20
    const marker = (document.getElementById('hist-list-marker') as HTMLInputElement).value.trim() || undefined
    try {
      const res = await client.history.listHistory({ filePath: stripLeadingSlash(filePath), limit, marker } as any)
      showResult('hist-list-result', res.data); logger.log(`历史版本列表查询成功: ${filePath}`)
    } catch (e: any) { showResult('hist-list-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('hist-latest-btn', async () => {
    const client = getClient(); if (!client) return
    const historyId = (document.getElementById('hist-latest-id') as HTMLInputElement).value.trim()
    if (!historyId) { logger.log('请填写历史版本 ID', 'error'); return }
    try {
      const res = await client.history.setHistoryLatest({ historyId } as any)
      showResult('hist-latest-result', res.data); logger.log(`已恢复历史版本 ${historyId} 为最新`)
    } catch (e: any) { showResult('hist-latest-result', e.message || e, true); logger.log(`恢复失败: ${e.message}`, 'error') }
  })

  bind('hist-del-btn', async () => {
    const client = getClient(); if (!client) return
    const idsText = (document.getElementById('hist-del-ids') as HTMLTextAreaElement).value.trim()
    const ids = idsText.split('\n').map(s => s.trim()).filter(Boolean)
    if (!ids.length) { logger.log('请填写历史版本 ID', 'error'); return }
    try {
      const res = await client.history.deleteHistory({ requestBody: ids } as any)
      showResult('hist-del-result', res.data); logger.log(`历史版本已删除: ${ids.length} 个`)
    } catch (e: any) { showResult('hist-del-result', e.message || e, true); logger.log(`删除失败: ${e.message}`, 'error') }
  })

  bind('hist-empty-btn', async () => {
    const client = getClient(); if (!client) return
    if (!confirm('确定要清空所有历史版本吗？需先关闭历史版本功能。')) return
    try {
      const res = await client.history.emptyHistory({} as any)
      showResult('hist-empty-result', res.data); logger.log('已清空历史版本')
    } catch (e: any) { showResult('hist-empty-result', e.message || e, true); logger.log(`清空失败: ${e.message}`, 'error') }
  })

  bind('hist-getconfig-btn', async () => {
    const client = getClient(); if (!client) return
    try {
      const res = await client.history.getHistoryConfig({} as any)
      showResult('hist-getconfig-result', res.data); logger.log('历史版本配置查询成功')
    } catch (e: any) { showResult('hist-getconfig-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('hist-setconfig-btn', async () => {
    const client = getClient(); if (!client) return
    const enabled = (document.getElementById('hist-setconfig-enabled') as HTMLSelectElement).value === 'true'
    const maxCount = parseInt((document.getElementById('hist-setconfig-count') as HTMLInputElement).value) || 20
    try {
      const res = await client.history.setHistoryConfig({
        setHistoryConfigRequest: { isFileHistoryEnabled: enabled, maxFileHistoryCount: maxCount }
      } as any)
      showResult('hist-setconfig-result', res.data); logger.log(`历史版本配置已保存`)
    } catch (e: any) { showResult('hist-setconfig-result', e.message || e, true); logger.log(`保存失败: ${e.message}`, 'error') }
  })
}
