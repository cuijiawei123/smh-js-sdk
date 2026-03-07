import { createClient, validateConfig, type SDKConfig } from './config'
import { logger } from './logger'
import { showResult, stripLeadingSlash } from './utils'

export function initSearch(getConfig: () => SDKConfig): void {
  const panel = document.getElementById('panel-search')!
  panel.innerHTML = `
    <div class="card">
      <h2>🔍 文件搜索</h2>

      <div class="api-section">
        <h3>搜索文件/文件夹 (searchFs)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>搜索关键词</label>
            <input type="text" id="search-keyword" placeholder="输入搜索关键词">
          </div>
          <div class="form-group">
            <label>搜索范围 (目录路径，可选)</label>
            <input type="text" id="search-scope" placeholder="留空搜索全部">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>搜索类型</label>
            <select id="search-type">
              <option value="">全部</option>
              <option value="file">仅文件</option>
              <option value="dir">仅文件夹</option>
            </select>
          </div>
          <div class="form-group">
            <label>每页数量</label>
            <input type="number" id="search-limit" value="50" min="1" max="100">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>排序字段</label>
            <select id="search-orderby">
              <option value="">默认</option>
              <option value="name">名称</option>
              <option value="modificationTime">修改时间</option>
              <option value="size">大小</option>
            </select>
          </div>
          <div class="form-group">
            <label>排序方向</label>
            <select id="search-order">
              <option value="asc">升序</option>
              <option value="desc">降序</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="search-btn">🔍 搜索</button>
        <div class="result-container" id="search-result"></div>
      </div>
    </div>
  `

  document.getElementById('search-btn')?.addEventListener('click', async () => {
    const config = getConfig()
    const err = validateConfig(config)
    if (err) { logger.log(err, 'error'); return }
    const client = createClient(config)

    const keyword = (document.getElementById('search-keyword') as HTMLInputElement).value.trim()
    if (!keyword) { logger.log('请输入搜索关键词', 'error'); return }

    const scope = (document.getElementById('search-scope') as HTMLInputElement).value.trim()
    const searchType = (document.getElementById('search-type') as HTMLSelectElement).value
    const limit = parseInt((document.getElementById('search-limit') as HTMLInputElement).value) || 50
    const orderBy = (document.getElementById('search-orderby') as HTMLSelectElement).value
    const orderByType = (document.getElementById('search-order') as HTMLSelectElement).value

    try {
      const params: any = { keyword, limit }
      if (scope) params.scope = stripLeadingSlash(scope)
      if (searchType) params.searchType = searchType
      if (orderBy) params.orderBy = orderBy
      if (orderByType) params.orderByType = orderByType

      const res = await client.search.searchFs(params)
      showResult('search-result', res.data)
      const total = (res.data as any)?.totalCount ?? (res.data as any)?.contents?.length ?? 0
      logger.log(`搜索完成: "${keyword}" 共 ${total} 条结果`)
    } catch (e: any) {
      showResult('search-result', e.message || e, true)
      logger.log(`搜索失败: ${e.message}`, 'error')
    }
  })
}
