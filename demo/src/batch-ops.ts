import { createClient, validateConfig, type SDKConfig } from './config'
import { logger } from './logger'
import { showResult, stripLeadingSlash } from './utils'

export function initBatchOps(getConfig: () => SDKConfig): void {
  const panel = document.getElementById('panel-batch-ops')!
  panel.innerHTML = `
    <div class="card">
      <h2>📋 批量操作</h2>

      <div class="api-section">
        <h3>批量复制 (batchCopy)</h3>
        <div class="form-group">
          <label>源文件路径列表（每行一个）</label>
          <textarea id="batch-copy-src" rows="4" placeholder="文件1.txt&#10;文件夹/文件2.doc"></textarea>
        </div>
        <div class="form-group">
          <label>目标目录路径</label>
          <input type="text" id="batch-copy-dest" placeholder="如: 目标文件夹">
        </div>
        <button class="btn btn-primary btn-sm" id="batch-copy-btn">批量复制</button>
        <div class="result-container" id="batch-copy-result"></div>
      </div>

      <div class="api-section">
        <h3>批量移动 (batchMove)</h3>
        <div class="form-group">
          <label>源文件路径列表（每行一个）</label>
          <textarea id="batch-move-src" rows="4" placeholder="文件1.txt&#10;文件夹/文件2.doc"></textarea>
        </div>
        <div class="form-group">
          <label>目标目录路径</label>
          <input type="text" id="batch-move-dest" placeholder="如: 目标文件夹">
        </div>
        <button class="btn btn-primary btn-sm" id="batch-move-btn">批量移动</button>
        <div class="result-container" id="batch-move-result"></div>
      </div>

      <div class="api-section">
        <h3>批量删除 (batchDelete)</h3>
        <div class="form-group">
          <label>文件路径列表（每行一个）</label>
          <textarea id="batch-delete-src" rows="4" placeholder="文件1.txt&#10;文件夹/文件2.doc"></textarea>
        </div>
        <button class="btn btn-danger btn-sm" id="batch-delete-btn">批量删除</button>
        <div class="result-container" id="batch-delete-result"></div>
      </div>
    </div>
  `

  const getClient = () => {
    const c = getConfig(); const e = validateConfig(c); if (e) { logger.log(e, 'error'); return null }; return createClient(c)
  }
  const parsePaths = (id: string) => (document.getElementById(id) as HTMLTextAreaElement).value.trim().split('\n').map(l => l.trim()).filter(Boolean).map(stripLeadingSlash)

  document.getElementById('batch-copy-btn')?.addEventListener('click', async () => {
    const client = getClient(); if (!client) return
    const paths = parsePaths('batch-copy-src')
    const dest = (document.getElementById('batch-copy-dest') as HTMLInputElement).value.trim()
    if (!paths.length || !dest) { logger.log('请填写源路径和目标路径', 'error'); return }
    try {
      const res = await client.batch.batchCopy({
        copy: '' as any,
        batchCopyRequest: paths.map(p => ({ copyFrom: p, to: stripLeadingSlash(dest) + '/' + p.split('/').pop() }))
      } as any)
      showResult('batch-copy-result', res.data)
      logger.log(`批量复制完成: ${paths.length} 个文件 -> ${dest}`)
    } catch (e: any) { showResult('batch-copy-result', e.message || e, true); logger.log(`批量复制失败: ${e.message}`, 'error') }
  })

  document.getElementById('batch-move-btn')?.addEventListener('click', async () => {
    const client = getClient(); if (!client) return
    const paths = parsePaths('batch-move-src')
    const dest = (document.getElementById('batch-move-dest') as HTMLInputElement).value.trim()
    if (!paths.length || !dest) { logger.log('请填写源路径和目标路径', 'error'); return }
    try {
      const res = await client.batch.batchMove({
        move: '' as any,
        batchMoveRequest: paths.map(p => ({ from: p, to: stripLeadingSlash(dest) + '/' + p.split('/').pop() }))
      } as any)
      showResult('batch-move-result', res.data)
      logger.log(`批量移动完成: ${paths.length} 个文件 -> ${dest}`)
    } catch (e: any) { showResult('batch-move-result', e.message || e, true); logger.log(`批量移动失败: ${e.message}`, 'error') }
  })

  document.getElementById('batch-delete-btn')?.addEventListener('click', async () => {
    const client = getClient(); if (!client) return
    const paths = parsePaths('batch-delete-src')
    if (!paths.length) { logger.log('请填写要删除的文件路径', 'error'); return }
    if (!confirm(`确定要批量删除 ${paths.length} 个文件/文件夹吗？`)) return
    try {
      const res = await client.batch.batchDelete({
        _delete: '' as any,
        batchDeleteRequest: paths.map(p => ({ filePath: p }))
      } as any)
      showResult('batch-delete-result', res.data)
      logger.log(`批量删除完成: ${paths.length} 个文件`)
    } catch (e: any) { showResult('batch-delete-result', e.message || e, true); logger.log(`批量删除失败: ${e.message}`, 'error') }
  })
}
