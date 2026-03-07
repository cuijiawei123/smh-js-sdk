import { createClient, validateConfig, type SDKConfig } from './config'
import { logger } from './logger'
import { showResult, stripLeadingSlash, formatJSON } from './utils'

function getPanel(): HTMLElement {
  return document.getElementById('panel-file-ops')!
}

export function initFileOps(getConfig: () => SDKConfig): void {
  const panel = getPanel()
  panel.innerHTML = `
    <div class="card">
      <h2>📄 文件操作</h2>

      <!-- 文件详情 -->
      <div class="api-section">
        <h3>查看文件详情 (infoFile)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>文件路径</label>
            <input type="text" id="fo-info-path" placeholder="如: 文件夹/文件.txt">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-info-btn">查询详情</button>
        <div class="result-container" id="fo-info-result"></div>
      </div>

      <!-- 复制文件 -->
      <div class="api-section">
        <h3>复制文件 (copyFile)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>源文件路径</label>
            <input type="text" id="fo-copy-src" placeholder="如: 文件夹/源文件.txt">
          </div>
          <div class="form-group">
            <label>目标文件路径</label>
            <input type="text" id="fo-copy-dest" placeholder="如: 目标文件夹/新文件.txt">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-copy-btn">复制文件</button>
        <div class="result-container" id="fo-copy-result"></div>
      </div>

      <!-- 移动/重命名文件 -->
      <div class="api-section">
        <h3>移动/重命名文件 (moveFile)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>源文件路径</label>
            <input type="text" id="fo-move-src" placeholder="如: 文件夹/源文件.txt">
          </div>
          <div class="form-group">
            <label>目标文件路径</label>
            <input type="text" id="fo-move-dest" placeholder="如: 目标文件夹/新文件.txt">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-move-btn">移动文件</button>
        <div class="result-container" id="fo-move-result"></div>
      </div>

      <!-- 预览文件 -->
      <div class="api-section">
        <h3>预览文件 (previewFile)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>文件路径</label>
            <input type="text" id="fo-preview-path" placeholder="如: 文件夹/文件.docx">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-preview-btn">获取预览</button>
        <div class="result-container" id="fo-preview-result"></div>
      </div>

      <!-- 获取缩略图 -->
      <div class="api-section">
        <h3>获取缩略图 (getCover)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>文件路径</label>
            <input type="text" id="fo-cover-path" placeholder="如: 图片.jpg">
          </div>
          <div class="form-group">
            <label>尺寸</label>
            <input type="text" id="fo-cover-size" value="200x200" placeholder="如: 200x200">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-cover-btn">获取缩略图</button>
        <div class="result-container" id="fo-cover-result"></div>
      </div>

      <!-- 创建符号链接 -->
      <div class="api-section">
        <h3>创建符号链接 (createSymlink)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>链接路径</label>
            <input type="text" id="fo-symlink-path" placeholder="如: 链接名.lnk">
          </div>
          <div class="form-group">
            <label>目标路径</label>
            <input type="text" id="fo-symlink-target" placeholder="如: 实际文件夹/文件.txt">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-symlink-btn">创建链接</button>
        <div class="result-container" id="fo-symlink-result"></div>
      </div>

      <!-- 文件格式转换 -->
      <div class="api-section">
        <h3>文件格式转换 (convertFile)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>文件路径</label>
            <input type="text" id="fo-convert-path" placeholder="如: 文档.docx">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-convert-btn">转换文件</button>
        <div class="result-container" id="fo-convert-result"></div>
      </div>

      <!-- 检查文件状态 -->
      <div class="api-section">
        <h3>检查文件状态 (checkFileStatus)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>文件路径</label>
            <input type="text" id="fo-status-path" placeholder="如: 文件.txt">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-status-btn">检查状态</button>
        <div class="result-container" id="fo-status-result"></div>
      </div>

      <!-- 通过 inode 查询 -->
      <div class="api-section">
        <h3>通过 inode 查询 (getFileInfoByInode)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>inode</label>
            <input type="text" id="fo-inode-val" placeholder="如: 123456">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-inode-btn">查询</button>
        <div class="result-container" id="fo-inode-result"></div>
      </div>

      <!-- 检查文件删除状态 -->
      <div class="api-section">
        <h3>检查文件删除状态 (checkFileDeletion)</h3>
        <div class="form-row">
          <div class="form-group">
            <label>inode</label>
            <input type="text" id="fo-deletion-path" placeholder="如: 123456">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="fo-deletion-btn">检查删除状态</button>
        <div class="result-container" id="fo-deletion-result"></div>
      </div>
    </div>
  `

  const bind = (btnId: string, handler: () => void) => {
    document.getElementById(btnId)?.addEventListener('click', handler)
  }

  const getClient = () => {
    const config = getConfig()
    const err = validateConfig(config)
    if (err) { logger.log(err, 'error'); return null }
    return createClient(config)
  }

  bind('fo-info-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('fo-info-path') as HTMLInputElement).value.trim()
    if (!filePath) { logger.log('请填写文件路径', 'error'); return }
    try {
      const res = await client.file.infoFile({ filePath: stripLeadingSlash(filePath), info: 1 } as any)
      showResult('fo-info-result', res.data)
      logger.log(`文件详情查询成功: ${filePath}`)
    } catch (e: any) { showResult('fo-info-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('fo-copy-btn', async () => {
    const client = getClient(); if (!client) return
    const src = (document.getElementById('fo-copy-src') as HTMLInputElement).value.trim()
    const dest = (document.getElementById('fo-copy-dest') as HTMLInputElement).value.trim()
    if (!src || !dest) { logger.log('请填写源路径和目标路径', 'error'); return }
    try {
      const res = await client.file.copyFile({ filePath: stripLeadingSlash(dest), copyFileRequest: { copyFrom: stripLeadingSlash(src) } } as any)
      showResult('fo-copy-result', res.data)
      logger.log(`文件复制成功: ${src} -> ${dest}`)
    } catch (e: any) { showResult('fo-copy-result', e.message || e, true); logger.log(`复制失败: ${e.message}`, 'error') }
  })

  bind('fo-move-btn', async () => {
    const client = getClient(); if (!client) return
    const src = (document.getElementById('fo-move-src') as HTMLInputElement).value.trim()
    const dest = (document.getElementById('fo-move-dest') as HTMLInputElement).value.trim()
    if (!src || !dest) { logger.log('请填写源路径和目标路径', 'error'); return }
    try {
      const res = await client.file.moveFile({ filePath: stripLeadingSlash(dest), moveFileRequest: { from: stripLeadingSlash(src) } } as any)
      showResult('fo-move-result', res.data)
      logger.log(`文件移动成功: ${src} -> ${dest}`)
    } catch (e: any) { showResult('fo-move-result', e.message || e, true); logger.log(`移动失败: ${e.message}`, 'error') }
  })

  bind('fo-preview-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('fo-preview-path') as HTMLInputElement).value.trim()
    if (!filePath) { logger.log('请填写文件路径', 'error'); return }
    try {
      const res = await client.file.previewFile({ filePath: stripLeadingSlash(filePath), preview: 1 } as any)
      showResult('fo-preview-result', res.data)
      logger.log(`预览获取成功: ${filePath}`)
    } catch (e: any) { showResult('fo-preview-result', e.message || e, true); logger.log(`预览失败: ${e.message}`, 'error') }
  })

  bind('fo-cover-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('fo-cover-path') as HTMLInputElement).value.trim()
    const size = (document.getElementById('fo-cover-size') as HTMLInputElement).value.trim()
    if (!filePath) { logger.log('请填写文件路径', 'error'); return }
    try {
      const res = await client.file.getCover({ filePath: stripLeadingSlash(filePath), preview: 1, size: parseInt(size) || 200 } as any)
      showResult('fo-cover-result', res.data)
      logger.log(`缩略图获取成功: ${filePath}`)
    } catch (e: any) { showResult('fo-cover-result', e.message || e, true); logger.log(`缩略图获取失败: ${e.message}`, 'error') }
  })

  bind('fo-symlink-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('fo-symlink-path') as HTMLInputElement).value.trim()
    const linkTo = (document.getElementById('fo-symlink-target') as HTMLInputElement).value.trim()
    if (!filePath || !linkTo) { logger.log('请填写链接路径和目标路径', 'error'); return }
    try {
      const res = await client.file.createSymlink({ filePath: stripLeadingSlash(filePath), createSymlinkRequest: { linkTo: stripLeadingSlash(linkTo) } } as any)
      showResult('fo-symlink-result', res.data)
      logger.log(`符号链接创建成功: ${filePath} -> ${linkTo}`)
    } catch (e: any) { showResult('fo-symlink-result', e.message || e, true); logger.log(`创建链接失败: ${e.message}`, 'error') }
  })

  bind('fo-convert-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('fo-convert-path') as HTMLInputElement).value.trim()
    if (!filePath) { logger.log('请填写文件路径', 'error'); return }
    try {
      const res = await client.file.convertFile({ filePath: stripLeadingSlash(filePath), convert: 1, convertFileRequest: {} } as any)
      showResult('fo-convert-result', res.data)
      logger.log(`文件格式转换成功: ${filePath}`)
    } catch (e: any) { showResult('fo-convert-result', e.message || e, true); logger.log(`转换失败: ${e.message}`, 'error') }
  })

  bind('fo-status-btn', async () => {
    const client = getClient(); if (!client) return
    const filePath = (document.getElementById('fo-status-path') as HTMLInputElement).value.trim()
    if (!filePath) { logger.log('请填写文件路径', 'error'); return }
    try {
      const res = await client.file.checkFileStatus({ filePath: stripLeadingSlash(filePath) })
      showResult('fo-status-result', res.data)
      logger.log(`文件状态: ${filePath} - ${formatJSON(res.data)}`)
    } catch (e: any) { showResult('fo-status-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('fo-inode-btn', async () => {
    const client = getClient(); if (!client) return
    const inode = (document.getElementById('fo-inode-val') as HTMLInputElement).value.trim()
    if (!inode) { logger.log('请填写 inode', 'error'); return }
    try {
      const res = await client.file.getFileInfoByInode({ iNode: inode } as any)
      showResult('fo-inode-result', res.data)
      logger.log(`inode 查询成功: ${inode}`)
    } catch (e: any) { showResult('fo-inode-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })

  bind('fo-deletion-btn', async () => {
    const client = getClient(); if (!client) return
    const inodeVal = (document.getElementById('fo-deletion-path') as HTMLInputElement).value.trim()
    if (!inodeVal) { logger.log('请填写 inode', 'error'); return }
    try {
      const res = await client.file.checkFileDeletion({ inode: inodeVal } as any)
      showResult('fo-deletion-result', res.data)
      logger.log(`删除状态查询成功: inode=${inodeVal}`)
    } catch (e: any) { showResult('fo-deletion-result', e.message || e, true); logger.log(`查询失败: ${e.message}`, 'error') }
  })
}
