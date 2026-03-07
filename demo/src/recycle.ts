import { createClient, validateConfig, type SDKConfig } from './config'
import { logger } from './logger'
import { showResult } from './utils'

export function initRecycle(getConfig: () => SDKConfig): void {
  const panel = document.getElementById('panel-recycle')!
  panel.innerHTML = `
    <div class="card">
      <h2>🗑️ 回收站管理</h2>

      <div class="api-section">
        <h3>回收站列表 - Marker 翻页 (recycleList)</h3>
        <div class="form-row">
          <div class="form-group"><label>每页数量</label><input type="number" id="rc-list-limit" value="20" min="1" max="100"></div>
          <div class="form-group"><label>Marker (翻页标记)</label><input type="text" id="rc-list-marker" placeholder="留空加载首页"></div>
        </div>
        <button class="btn btn-primary btn-sm" id="rc-list-btn">查询列表</button>
        <div class="result-container" id="rc-list-result"></div>
      </div>

      <div class="api-section">
        <h3>回收站列表 - 分页 (recycleListByPage)</h3>
        <div class="form-row">
          <div class="form-group"><label>页码</label><input type="number" id="rc-page-num" value="1" min="1"></div>
          <div class="form-group"><label>每页数量</label><input type="number" id="rc-page-limit" value="20" min="1" max="100"></div>
        </div>
        <button class="btn btn-primary btn-sm" id="rc-page-btn">查询列表</button>
        <div class="result-container" id="rc-page-result"></div>
      </div>

      <div class="api-section">
        <h3>回收站文件详情 (recycleInfo)</h3>
        <div class="form-group"><label>回收站项 ID</label><input type="text" id="rc-info-id" placeholder="recycledItemId"></div>
        <button class="btn btn-primary btn-sm" id="rc-info-btn">查询详情</button>
        <div class="result-container" id="rc-info-result"></div>
      </div>

      <div class="api-section">
        <h3>回收站文件预览 (recyclePreview)</h3>
        <div class="form-group"><label>回收站项 ID</label><input type="text" id="rc-preview-id" placeholder="recycledItemId"></div>
        <button class="btn btn-primary btn-sm" id="rc-preview-btn">预览</button>
        <div class="result-container" id="rc-preview-result"></div>
      </div>

      <div class="api-section">
        <h3>恢复文件 (recycleRestore)</h3>
        <div class="form-group"><label>回收站项 ID</label><input type="text" id="rc-restore-id" placeholder="recycledItemId"></div>
        <button class="btn btn-success btn-sm" id="rc-restore-btn">恢复文件</button>
        <div class="result-container" id="rc-restore-result"></div>
      </div>

      <div class="api-section">
        <h3>批量恢复 (recycleRestoreBatch)</h3>
        <div class="form-group"><label>回收站项 ID 列表（每行一个）</label><textarea id="rc-brestore-ids" rows="3" placeholder="id1&#10;id2"></textarea></div>
        <button class="btn btn-success btn-sm" id="rc-brestore-btn">批量恢复</button>
        <div class="result-container" id="rc-brestore-result"></div>
      </div>

      <div class="api-section">
        <h3>彻底删除 (recyclePurge)</h3>
        <div class="form-group"><label>回收站项 ID</label><input type="text" id="rc-purge-id" placeholder="recycledItemId"></div>
        <button class="btn btn-danger btn-sm" id="rc-purge-btn">彻底删除</button>
        <div class="result-container" id="rc-purge-result"></div>
      </div>

      <div class="api-section">
        <h3>批量彻底删除 (recyclePurgeBatch)</h3>
        <div class="form-group"><label>回收站项 ID 列表（每行一个）</label><textarea id="rc-bpurge-ids" rows="3" placeholder="id1&#10;id2"></textarea></div>
        <button class="btn btn-danger btn-sm" id="rc-bpurge-btn">批量彻底删除</button>
        <div class="result-container" id="rc-bpurge-result"></div>
      </div>

      <div class="api-section">
        <h3>清空回收站 (recycleEmpty)</h3>
        <button class="btn btn-danger btn-sm" id="rc-empty-btn">清空回收站</button>
        <div class="result-container" id="rc-empty-result"></div>
      </div>

      <div class="api-section">
        <h3>设置回收站生命周期 (recycleSetLifecycle)</h3>
        <div class="form-group"><label>保留天数</label><input type="number" id="rc-lifecycle-days" value="30" min="1"></div>
        <button class="btn btn-primary btn-sm" id="rc-lifecycle-btn">设置生命周期</button>
        <div class="result-container" id="rc-lifecycle-result"></div>
      </div>
    </div>
  `

  const getClient = () => {
    const c = getConfig(); const e = validateConfig(c); if (e) { logger.log(e, 'error'); return null }; return createClient(c)
  }
  const bind = (id: string, fn: () => void) => document.getElementById(id)?.addEventListener('click', fn)
  const parseIds = (id: string) => (document.getElementById(id) as HTMLTextAreaElement).value.trim().split('\n').map(s => s.trim()).filter(Boolean).map(Number)

  bind('rc-list-btn', async () => {
    const client = getClient(); if (!client) return
    const limit = parseInt((document.getElementById('rc-list-limit') as HTMLInputElement).value) || 20
    const marker = (document.getElementById('rc-list-marker') as HTMLInputElement).value.trim() || undefined
    try {
      const res = await client.recycled.recycleList({ byMarker: 1 as any, limit, marker } as any)
      showResult('rc-list-result', res.data); logger.log('回收站列表查询成功')
    } catch (e: any) { showResult('rc-list-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('rc-page-btn', async () => {
    const client = getClient(); if (!client) return
    const page = parseInt((document.getElementById('rc-page-num') as HTMLInputElement).value) || 1
    const pageSize = parseInt((document.getElementById('rc-page-limit') as HTMLInputElement).value) || 20
    try {
      const res = await client.recycled.recycleListByPage({ byPage: 1 as any, page, pageSize } as any)
      showResult('rc-page-result', res.data); logger.log(`回收站分页列表: 第${page}页`)
    } catch (e: any) { showResult('rc-page-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('rc-info-btn', async () => {
    const client = getClient(); if (!client) return
    const recycledItemId = parseInt((document.getElementById('rc-info-id') as HTMLInputElement).value.trim())
    if (!recycledItemId) { logger.log('请填写回收站项 ID', 'error'); return }
    try {
      const res = await client.recycled.recycleInfo({ recycledItemId, info: 1 } as any)
      showResult('rc-info-result', res.data); logger.log('回收站详情查询成功')
    } catch (e: any) { showResult('rc-info-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('rc-preview-btn', async () => {
    const client = getClient(); if (!client) return
    const recycledItemId = parseInt((document.getElementById('rc-preview-id') as HTMLInputElement).value.trim())
    if (!recycledItemId) { logger.log('请填写回收站项 ID', 'error'); return }
    try {
      const res = await client.recycled.recyclePreview({ recycledItemId, preview: 1 } as any)
      showResult('rc-preview-result', res.data); logger.log('回收站预览获取成功')
    } catch (e: any) { showResult('rc-preview-result', e.message || e, true); logger.log(`预览失败: ${e.message}`, 'error') }
  })

  bind('rc-restore-btn', async () => {
    const client = getClient(); if (!client) return
    const recycledItemId = parseInt((document.getElementById('rc-restore-id') as HTMLInputElement).value.trim())
    if (!recycledItemId) { logger.log('请填写回收站项 ID', 'error'); return }
    try {
      const res = await client.recycled.recycleRestore({ recycledItemId, restore: 1 as any } as any)
      showResult('rc-restore-result', res.data); logger.log(`文件恢复成功: ${recycledItemId}`)
    } catch (e: any) { showResult('rc-restore-result', e.message || e, true); logger.log(`恢复失败: ${e.message}`, 'error') }
  })

  bind('rc-brestore-btn', async () => {
    const client = getClient(); if (!client) return
    const ids = parseIds('rc-brestore-ids')
    if (!ids.length) { logger.log('请填写回收站项 ID', 'error'); return }
    try {
      const res = await client.recycled.recycleRestoreBatch({ restore: 1, recycleRestoreBatchRequest: ids } as any)
      showResult('rc-brestore-result', res.data); logger.log(`批量恢复完成: ${ids.length} 个`)
    } catch (e: any) { showResult('rc-brestore-result', e.message || e, true); logger.log(`批量恢复失败: ${e.message}`, 'error') }
  })

  bind('rc-purge-btn', async () => {
    const client = getClient(); if (!client) return
    const recycledItemId = parseInt((document.getElementById('rc-purge-id') as HTMLInputElement).value.trim())
    if (!recycledItemId) { logger.log('请填写回收站项 ID', 'error'); return }
    if (!confirm('确定要彻底删除此文件吗？此操作不可恢复！')) return
    try {
      const res = await client.recycled.recyclePurge({ recycledItemId } as any)
      showResult('rc-purge-result', res.data); logger.log(`彻底删除成功: ${recycledItemId}`)
    } catch (e: any) { showResult('rc-purge-result', e.message || e, true); logger.log(`删除失败: ${e.message}`, 'error') }
  })

  bind('rc-bpurge-btn', async () => {
    const client = getClient(); if (!client) return
    const ids = parseIds('rc-bpurge-ids')
    if (!ids.length) { logger.log('请填写回收站项 ID', 'error'); return }
    if (!confirm(`确定要彻底删除 ${ids.length} 个文件吗？`)) return
    try {
      const res = await client.recycled.recyclePurgeBatch({ _delete: 1, recyclePurgeBatchRequest: ids } as any)
      showResult('rc-bpurge-result', res.data); logger.log(`批量彻底删除完成: ${ids.length} 个`)
    } catch (e: any) { showResult('rc-bpurge-result', e.message || e, true); logger.log(`批量删除失败: ${e.message}`, 'error') }
  })

  bind('rc-empty-btn', async () => {
    const client = getClient(); if (!client) return
    if (!confirm('确定要清空回收站吗？所有文件将被永久删除！')) return
    try {
      const res = await client.recycled.recycleEmpty({} as any)
      showResult('rc-empty-result', res.data); logger.log('回收站已清空')
    } catch (e: any) { showResult('rc-empty-result', e.message || e, true); logger.log(`清空失败: ${e.message}`, 'error') }
  })

  bind('rc-lifecycle-btn', async () => {
    const client = getClient(); if (!client) return
    const days = parseInt((document.getElementById('rc-lifecycle-days') as HTMLInputElement).value) || 30
    try {
      const res = await client.recycled.recycleSetLifecycle({ lifecycle: 1, recycleSetLifecycleRequest: { recycleDays: days } } as any)
      showResult('rc-lifecycle-result', res.data); logger.log(`回收站生命周期已设置为 ${days} 天`)
    } catch (e: any) { showResult('rc-lifecycle-result', e.message || e, true); logger.log(`设置失败: ${e.message}`, 'error') }
  })
}
