import { createClient, validateConfig, type SDKConfig } from './config'
import { logger } from './logger'
import { showResult, stripLeadingSlash } from './utils'

export function initFavorite(getConfig: () => SDKConfig): void {
  const panel = document.getElementById('panel-favorite')!
  panel.innerHTML = `
    <div class="card">
      <h2>⭐ 收藏管理</h2>

      <div class="api-section">
        <h3>收藏列表 (listFavorite)</h3>
        <div class="form-row">
          <div class="form-group"><label>每页数量</label><input type="number" id="fav-list-limit" value="20" min="1" max="100"></div>
          <div class="form-group"><label>页码</label><input type="number" id="fav-list-page" value="1" min="1"></div>
        </div>
        <button class="btn btn-primary btn-sm" id="fav-list-btn">查询收藏列表</button>
        <div class="result-container" id="fav-list-result"></div>
      </div>

      <div class="api-section">
        <h3>收藏文件/目录 (createFavorite)</h3>
        <div class="form-group"><label>文件/目录路径</label><input type="text" id="fav-create-path" placeholder="如: 文件夹/文件.txt"></div>
        <button class="btn btn-primary btn-sm" id="fav-create-btn">⭐ 添加收藏</button>
        <div class="result-container" id="fav-create-result"></div>
      </div>

      <div class="api-section">
        <h3>取消收藏 (deleteFavorite)</h3>
        <div class="form-group"><label>文件/目录路径</label><input type="text" id="fav-delete-path" placeholder="如: 文件夹/文件.txt"></div>
        <button class="btn btn-danger btn-sm" id="fav-delete-btn">取消收藏</button>
        <div class="result-container" id="fav-delete-result"></div>
      </div>
    </div>
  `

  const getClient = () => {
    const c = getConfig(); const e = validateConfig(c); if (e) { logger.log(e, 'error'); return null }; return createClient(c)
  }
  const bind = (id: string, fn: () => void) => document.getElementById(id)?.addEventListener('click', fn)

  bind('fav-list-btn', async () => {
    const client = getClient(); if (!client) return
    const limit = parseInt((document.getElementById('fav-list-limit') as HTMLInputElement).value) || 20
    const page = parseInt((document.getElementById('fav-list-page') as HTMLInputElement).value) || 1
    try {
      const res = await client.favorite.listFavorite({ page, pageSize: limit, withPath: true } as any)
      showResult('fav-list-result', res.data); logger.log('收藏列表查询成功')
    } catch (e: any) { showResult('fav-list-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('fav-create-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('fav-create-path') as HTMLInputElement).value.trim()
    if (!filePath) { logger.log('请填写路径', 'error'); return }
    try {
      const res = await client.favorite.createFavorite({ createFavoriteRequest: { path: stripLeadingSlash(filePath) } } as any)
      showResult('fav-create-result', res.data); logger.log(`收藏成功: ${filePath}`)
    } catch (e: any) { showResult('fav-create-result', e.message || e, true); logger.log(`收藏失败: ${e.message}`, 'error') }
  })

  bind('fav-delete-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('fav-delete-path') as HTMLInputElement).value.trim()
    if (!filePath) { logger.log('请填写路径', 'error'); return }
    try {
      const res = await client.favorite.deleteFavorite({ cancel: '' as any, deleteFavoriteRequest: { path: stripLeadingSlash(filePath) } } as any)
      showResult('fav-delete-result', res.data); logger.log(`已取消收藏: ${filePath}`)
    } catch (e: any) { showResult('fav-delete-result', e.message || e, true); logger.log(`取消失败: ${e.message}`, 'error') }
  })
}
