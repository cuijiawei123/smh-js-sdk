# smh-js-sdk · AI / Agent 使用手册

> 本文档面向 Coding Agent（Codex / Claude / CodeBuddy 等）。目标不是复述全部 API，而是让 Agent 在接到需求时能快速判断：**该用哪个 SDK 入口、如何初始化、哪些参数会自动注入、哪些能力必须走高层封装、哪些坑不要踩**。
> 人类开发者可先看 [README.md](../README.md)，细节参数再查本目录下各 `*Api.md`。

---

## 0. 先建立心智模型

- **这是浏览器端 SDK**：面向 Web 前端，依赖 `File` / `Blob` / `ArrayBuffer` / `BigInt` / `WebAssembly`。不要把它当 Node 后端 SDK 用。
- **包名与入口**：`import { SMHClient } from 'smh-js-sdk'`。不要从旧示例复制 `@tencent/smh-js-sdk`，除非用户明确说使用内部包名。
- **首选入口永远是 `SMHClient`**：用 `new SMHClient(...)` 后调用 `client.<module>.<method>({ ... })`，不要绕过 SDK 手写 `axios` / `fetch`。
- **低层 OpenAPI 类已生成，高层能力在 `SMHClient`**：普通资源管理走 `client.file` / `client.directory` 等模块；上传下载走 `client.createUploadTask` / `client.createDownloadTask` / `client.downloadByUrl`。
- **请求返回的是 `AxiosResponse<T>`**：业务数据在 `res.data`，不是 `res` 本身。
- **构造时传入的 `libraryId` / `spaceId` / `accessToken` 会自动注入**：后续调用只传业务参数；只有跨空间、跨媒体库或临时用户身份时才显式覆盖。
- **`accessToken` 必须由后端签发**：浏览器端不要暴露 `librarySecret`，也不要在前端调用创建 token 的后端敏感流程。
- **错误统一包装为 `SMHError`**：展示用 `error.message`，分支用 `error.code`，排障用 `error.status` / `error.reqId` / `error.response?.serverCode`。

---

## 1. 需求到 SDK 入口的路由表

先按用户意图选入口，再写代码。

| 用户需求 | 应使用 | 不要误用 |
|---|---|---|
| 列目录、分页展示文件列表 | `client.directory.listDirectory`，循环 `nextMarker` | 不要用搜索接口实现普通列表页 |
| 创建/删除/移动/复制目录 | `client.directory.createDirectory` / `deleteDirectory` / `moveDirectory` / `copyDirectory` | 不要手写 REST 路径 |
| 文件详情、下载/预览链接、短链 | `client.file.infoFile({ info: 1 })`，短链加 `withShortLink: 1` | 短链不是 `share` |
| 浏览器触发下载 | `client.downloadByUrl` | 不要先下载 Blob 再手动保存大文件 |
| 需要 Blob、预览或二次处理 | `client.createDownloadTask(...).startAndGetBlob()` | 不要用 `downloadByUrl` 后期待拿到 Blob |
| 上传浏览器 `File` | `client.createUploadTask` | 不要直接调 `simpleUploadFile` / `multipartUploadFile` 组合低层接口 |
| 文件名搜索、普通关键字搜索 | `client.search.searchFs`，`keywords: string[]` | 不要用 `searchAI` 做精准文件名搜索 |
| 正文全文关键字搜索 | `client.search.searchFs({ searchFsRequest: { type: 'filecontent' } })` | 不要把 `keywords` 写成字符串 |
| 自然语言语义检索文档 | `client.search.searchAI({ type: 'text', keywords: string })` | 不要传 `marker`，该接口不分页 |
| 文搜图/图片语义检索 | `client.search.searchAI({ type: 'pic', keywords: string })` | 不要用 `searchFs` |
| 搜索结果聚合统计 | `client.search.searchFsStats` | 不要前端全量拉取后自己统计大数据集 |
| 收藏/取消收藏/收藏列表 | `client.favorite.createFavorite` / `deleteFavorite` / `listFavorite` | 不要用 labels 代替收藏 |
| 最近使用文件 | `client.recent.listRecentlyUsedFile` | 不是 `listRecent` |
| 分享链接生命周期 | `client.share.createShare` / `listShares` / `getShareDetail` / `updateShare` / `deleteShare` | 分享链接和下载短链是两套能力 |
| 回收站列表、恢复、永久删除 | `client.recycled.*` | 不要用普通删除接口恢复文件 |
| 历史版本列表、配置、设为最新版 | `client.history.*` | 下载历史版本时可在下载/详情接口传 `historyId` |
| 异步任务轮询 | `client.task.queryTask` / `queryTaskV2` / `queryLibraryTask` | 不要固定 sleep 一次就结束 |
| 空间容量、配额、用量 | `client.space` / `client.quota` / `client.usage` | 区分空间属性、配额和用量统计 |
| 增量同步 | `client.file.getDeltaCursor` + `client.file.queryDeltaLog` | cursor 要持久化，过期后回退全量 |
| 压缩包预览/解压 | 预览 `client.file.previewZipFile`（同步）；解压 `client.file.uncompressFile`（异步，返回 taskId 要轮询） | 预览不解压、解压不要当同步接口；都需开启 `enableFileUncompress` |
| HLS/m3u8、转码、媒体信息 | `client.hls.*` 或 `client.file.convertFile` | 不要把普通文件下载当转码任务 |

---

## 2. 初始化模板

```typescript
import { SMHClient, SMHError, ErrorCode, ServerErrorCode } from 'smh-js-sdk'

const client = new SMHClient({
  basePath: 'https://your-domain.api.tencentsmh.cn',
  libraryId: 'your-library-id',
  spaceId: 'your-space-id',
  accessToken: 'token-from-your-backend',
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  onTokenRefresh: async () => {
    const res = await fetch('/api/refresh-smh-token')
    const data = await res.json()
    return data.accessToken
  },
})
```

硬规则：

1. `basePath` 用用户自己的 SMH 专属域名，不要硬编码公共示例域名。
2. `librarySecret`、token 创建/签发放后端；浏览器只拿后端签发的 `accessToken`。
3. `onTokenRefresh` 返回新 token 字符串。多个并发请求同时过期时 SDK 会共用一次续期结果。
4. 若构造时没传 `spaceId` 或需要跨空间访问，在单次调用里显式传 `spaceId`。
5. `client.setDefaultAccessToken` / `setDefaultLibraryId` / `setDefaultSpaceId` 可用于运行时更新默认值。

---

## 3. 通用调用规范

所有模块方法都用对象参数：

```typescript
const res = await client.directory.listDirectory({
  filePath: '/',
  limit: 100,
})

console.log(res.data.contents)
```

路径规范：

- 文件和目录路径统一使用正斜杠 `/`。
- 根目录是 `'/'`。
- 示例里优先写前导 `/`，如 `/docs/a.pdf`。
- 不要用 Windows 反斜杠 `\`。

分页规范：

```typescript
async function listAllFiles(dir: string) {
  const all: any[] = []
  let marker: string | undefined

  do {
    const { data } = await client.directory.listDirectory({
      filePath: dir,
      limit: 200,
      marker,
    })
    all.push(...(data.contents ?? []))
    marker = data.nextMarker
  } while (marker)

  return all
}
```

优先使用 marker 分页。只有用户明确需要传统页码时，才考虑 `listDirectoryByPage` 等 page/pageSize 接口。

---

## 4. 文件上传：优先高层任务

上传浏览器 `File` 时使用 `client.createUploadTask`。它会自动选择简单上传/分片上传，支持秒传、断点续传、CRC64、暂停/恢复、取消、进度回调和签名续期。

```typescript
const uploader = client.createUploadTask({
  filePath: `/uploads/${file.name}`,
  file,
  enableInstantUpload: true,
  chunkSize: 5,
  parallel: 2,
  conflictResolutionStrategy: 'rename',
  onProgress: ({ state, progress, speed }) => {
    console.log(state, progress, speed)
  },
  onStateChange: (_checkpoint, state, error) => {
    if (state === 'error' && error) {
      console.error(error.message)
    }
  },
})

await uploader.start()
```

交互控制：

```typescript
await uploader.pause()
await uploader.start()
await uploader.cancel()
```

Agent 判断规则：

- 用户说“上传文件/大文件/断点续传/秒传/暂停恢复/上传队列”，默认用 `createUploadTask`。
- 不要让业务方手动编排 `formUploadFile`、`simpleUploadFile`、`multipartUploadFile`、`completeFileUpload`，除非用户明确要调试底层 API。
- `chunkSize` 单位是 MB；`trafficLimit` 单位是 B/s。
- `file` 必须是浏览器 `File` 对象，不是普通对象，也不是只有内容的 `Blob`。

---

## 5. 文件下载、详情与短链

### 5.1 浏览器直接下载

适合任意大小文件，不占用 JS 内存：

```typescript
await client.downloadByUrl({
  filePath: '/docs/report.pdf',
  fileName: 'report.pdf',
})
```

### 5.2 下载为 Blob

适合前端预览、二次处理、小到中等大小文件：

```typescript
const downloader = client.createDownloadTask({
  filePath: '/docs/report.pdf',
  chunkSize: 5,
  parallel: 2,
  onProgress: ({ progress }) => console.log(progress),
})

const blob = await downloader.startAndGetBlob()
```

### 5.3 获取文件信息、下载链接、短链

`infoFile` 返回文件详情与 `cosUrl`。如果用户要“短链下载地址/短链预览地址/指定链接有效期”，仍然用 `file.infoFile`：

```typescript
const { data } = await client.file.infoFile({
  filePath: '/docs/report.pdf',
  info: 1,
  withShortLink: 1,
  period: 3600,
})

const url = data.cosUrl
```

规则：

- `withShortLink: 1` 后，`cosUrl` 会被替换成短链形式。
- `period` 是链接有效期，单位秒，范围 `[60, 7200]`，默认 7200。
- `preCheck: 1` 只做可下载/可预览校验，不返回 `cosUrl`。
- `purpose: 'download' | 'preview'` 用于决定最近使用记录等服务端行为。
- 短链不是分享链接；需要对外分享、有提取码/过期时间/权限配置时才用 `client.share`。

---

## 6. 搜索：先选模式

SMH 搜索有三类入口，Agent 必须先判断用户要的是“关键词命中”“语义理解”还是“统计”。

### 6.1 文件名/普通关键字搜索

```typescript
const { data } = await client.search.searchFs({
  limit: 20,
  withInode: 1,
  searchFsRequest: {
    type: 'filename',
    keywords: ['合同', '报告'],
    scope: '/docs',
    inExtnames: ['.pdf', '.docx'],
    fileTypes: ['file'],
  },
})
```

### 6.2 文件正文全文关键字搜索

```typescript
const { data } = await client.search.searchFs({
  limit: 20,
  withInode: 1,
  searchFsRequest: {
    type: 'filecontent',
    keywords: ['季度营收', '分析结果'],
    inExtnames: ['.pdf', '.docx', '.txt'],
    fileTypes: ['file'],
  },
})
```

规则：

- `searchFsRequest.keywords` 是 `string[]`。
- `type=filename` 默认按文件名命中。
- `type=filecontent` 按正文全文检索，结果可包含 `text`、`textPage`、`searchScore`、`contentHighlight`。
- `searchFs` 支持 `marker` / `nextMarker` 翻页。
- 全文索引能力可能需要白名单；HTTP 4xx 时先提示能力/参数限制，不要马上改成手写接口。

### 6.3 混合检索 / 语义检索 / 文搜图

```typescript
const { data } = await client.search.searchAI({
  limit: 10,
  searchAIRequest: {
    type: 'text',
    keywords: '查找关于季度营收分析和经营风险的材料',
    inExtnames: ['.pdf', '.docx'],
    categories: ['document'],
  },
})
```

```typescript
const { data } = await client.search.searchAI({
  limit: 20,
  searchAIRequest: {
    type: 'pic',
    keywords: '蓝天白云的户外活动照片',
    inExtnames: ['.jpg', '.png'],
  },
})
```

规则：

- `searchAIRequest.keywords` 是单个 `string`，不是数组。
- `type: 'text'` 用自然语言搜文档，结果含 `inode`、`score`，文档命中时可含 `text`、`textPage`。
- `type: 'pic'` 用自然语言搜图片，结果含 `inode`、`score`。
- `searchAI` 不支持 `marker` / `nextMarker` 翻页，只用 `limit`。
- `type=text` 的 `limit` 上限 30；`type=pic` 上限 100。
- 该能力需开通白名单；未开通可能返回 HTTP 4xx。

### 6.4 搜索聚合统计

当用户要“按类型统计数量”“搜索结果 group/count/sum/distinct/min/max/average”时，用 `searchFsStats`：

```typescript
const { data } = await client.search.searchFsStats({
  searchFsStatsRequest: {
    keywords: ['合同'],
    aggregations: [
      { field: 'fileType', operation: 'group' },
      { field: 'size', operation: 'sum' },
    ],
  },
})
```

---

## 7. 目录、文件、批量与异步任务

常用资源操作：

```typescript
await client.directory.createDirectory({ filePath: '/new-folder' })
await client.directory.moveDirectory({
  filePath: '/new-folder',
  conflictResolutionStrategy: 'rename',
  moveDirectoryRequest: {
    from: '/old-folder',
  },
})

await client.file.copyFile({
  filePath: '/b.txt',
  conflictResolutionStrategy: 'rename',
  copyFileRequest: {
    copyFrom: '/a.txt',
  },
})

await client.batch.batchDelete({
  _delete: 1,
  batchDeleteRequest: [
    { path: '/a.txt' },
    { path: '/old-folder', permanent: true },
  ],
})
```

说明：

- 目录方法在 `client.directory`，文件方法在 `client.file`，多项操作在 `client.batch`。
- 批量、复制、转码、统计校准等接口可能返回 `taskId` 或 202，需要用 `client.task.queryTask` / `queryTaskV2` 轮询。
- `queryTaskV2` / `queryLibraryTaskV2` 用于新版任务结果；若文档示例给出 V2，优先使用 V2。
- 不确定请求体字段时，查对应 `sdk-docs/*Api.md` 或 `apis/*-api.ts` 的 `Request` 类型，不要猜字段名。

### 7.1 压缩包预览与解压

需在 library 级别开启 `enableFileUncompress`；`filePath` 必须指向压缩包文件。

```typescript
// 预览（同步）：列出包内文件，不解压。format 可选 'flat'(默认) / 'tree'
const preview = await client.file.previewZipFile({
  filePath: '/archive.zip',
  zipPreview: 1,
})
// preview.data.contents 里的 key 可作为选择性解压的 selectedFilePaths

// 解压（异步）：返回 taskId，必须轮询任务，结果在 fileUncompressResult
const res = await client.file.uncompressFile({
  filePath: '/archive.zip',
  uncompress: 1,
  uncompressFileRequest: { targetPath: '/extracted/' },  // 目标目录须已存在
})
const task = await client.task.queryTaskV2({ taskId: res.data.taskId })
// task.data.status / task.data.fileUncompressResult
```

- `previewZipFile` 是**同步**接口，直接读 `res.data`；不要当异步任务轮询。
- `uncompressFile` 是**异步**任务，必须用 `queryTaskV2` 轮询，解压结果看 `fileUncompressResult`；不要提交后就当完成。
- 选择性解压用 `selectedFilePaths`（路径取自预览返回的 `key`，目录以 `/` 结尾）；`targetPath` 目录不存在会报 `DirectoryNotFound`。
- 预览支持 zip/tar/gz/7zip/rar（apk 不支持预览）；解压额外支持 apk。

---

## 8. 增量同步与目录统计

### 8.1 增量同步

```typescript
const cursorRes = await client.file.getDeltaCursor({})
let cursor = cursorRes.data.cursor
let hasMore = true

while (hasMore) {
  const { data } = await client.file.queryDeltaLog({ cursor })
  for (const event of data.contents ?? []) {
    console.log(event.eventType, event.name, event.inode, event.eventTime)
  }
  cursor = data.cursor
  hasMore = Boolean(data.hasMore)
}
```

规则：

- cursor 要由业务侧持久化，下次从上次 cursor 继续。
- cursor 有效期约 180 天；如果服务端返回过期类错误，重新 `getDeltaCursor` 并做一次全量同步。
- 不要用搜索接口代替增量同步。

### 8.2 目录统计

```typescript
const { data } = await client.directory.getDirectoryStats({
  filePath: '/project',
  stats: 1,
  statsType: 'normal',
})

console.log(data.storage, data.fileCount, data.dirCount)
```

如果需要校准统计：

```typescript
const { data } = await client.directory.calibrateDirectoryStats({
  filePath: '/project',
  calibrate: 1,
  statsType: 'normal',
})

const task = await client.task.queryTask({ taskId: data.taskId })
```

`stats: 1` / `calibrate: 1` 是 OpenAPI 生成方法需要的固定参数，不要省略。

---

## 9. 分享、收藏、最近使用、历史与回收站

分享链接：

```typescript
const { data } = await client.share.createShare({
  createShareRequest: {
    name: 'report.pdf',
    filePath: ['/docs/report.pdf'],
    config: {
      isPermanent: false,
      expireTime: '2026-12-31T23:59:59.000Z',
      canPreview: true,
      canDownload: true,
    },
  },
})
```

规则：

- `share` 面向对外分享、提取码、分享列表、保存分享文件等业务。
- `file.infoFile({ withShortLink: 1 })` 面向下载/预览链接短链化。
- 收藏用 `client.favorite`，最近使用用 `client.recent.listRecentlyUsedFile`。
- 历史版本用 `client.history`；下载或查看某个历史版本时关注支持 `historyId` 的文件接口。
- 回收站用 `client.recycled`；恢复/永久删除不要走普通文件删除接口。

---

## 10. 错误处理模板

```typescript
try {
  const { data } = await client.file.infoFile({
    filePath: '/x.txt',
    info: 1,
  })
  return data
} catch (error) {
  if (error instanceof SMHError) {
    console.error(error.message)

    if (error.code === ErrorCode.NETWORK_ERROR) {
      console.warn('网络异常或 DNS/跨域问题')
    }
    if (error.code === ErrorCode.SERVER_ERROR) {
      console.warn('服务端 5xx，可提示稍后重试')
    }
    if (error.response?.serverCode === ServerErrorCode.NoPermission) {
      console.warn('没有权限')
    }

    console.log(error.status, error.reqId, error.response?.serverCode)
  }
  throw error
}
```

规则：

- `ErrorCode` 是 SDK 统一错误码，读 `error.code`。
- `ServerErrorCode` 是服务端原始错误码，读 `error.response?.serverCode`。
- 不要把两套码混用。
- 展示给用户优先用 `error.message`，它已经过 SDK 友好化处理。

---

## 11. Agent 常见误用清单

| # | 误用 | 正确做法 |
|---|---|---|
| 1 | 使用 `@tencent/smh-js-sdk` | 本仓库默认使用 `smh-js-sdk` |
| 2 | 在前端暴露 `librarySecret` 或创建 token | token 由后端签发，前端只用 `accessToken` |
| 3 | 绕过 SDK 用 `axios` / `fetch` 拼接口 | 用 `SMHClient`，保留重试、续期、错误包装 |
| 4 | 构造时传了默认值，调用时又重复传 | 默认自动注入，只有覆盖时才显式传 |
| 5 | 以为 `client.xxx()` 直接返回业务数据 | 业务数据在 `res.data` |
| 6 | 路径没有 `/` 开头或使用 `\` | 用 `/docs/a.pdf` 这类正斜杠路径 |
| 7 | 普通列表页用 `searchFs` | 列目录用 `directory.listDirectory` |
| 8 | 文件上传手动编排底层上传 API | 浏览器文件上传用 `createUploadTask` |
| 9 | 大文件下载先拿 Blob 再保存 | 直接保存用 `downloadByUrl` |
| 10 | `downloadByUrl` 后期待有进度或 Blob | 要进度/Blob 用 `createDownloadTask` |
| 11 | 短链走 `client.share` | 下载/预览短链用 `file.infoFile({ withShortLink: 1 })` |
| 12 | 混淆搜索参数类型 | `searchFs.keywords` 是 `string[]`；`searchAI.keywords` 是 `string` |
| 13 | 给 `searchAI` 传 `marker` 翻页 | `searchAI` 不分页，只支持 `limit` |
| 14 | 遇到 `searchAI` 4xx 就改成手写接口 | 先确认白名单、limit、keywords、文件类型限制 |
| 15 | 忽略 `nextMarker` | `list*` / `searchFs` 等分页接口要循环 |
| 16 | Delta cursor 不持久化 | 保存 cursor；过期后全量回补 |
| 17 | 漏传 `stats: 1` / `calibrate: 1` | 目录统计/校准要传固定常量 |
| 18 | 把 `ServerErrorCode` 当 `ErrorCode` | `error.code` 和 `error.response.serverCode` 分开判断 |
| 19 | 在 Node 服务端使用本 SDK 处理密钥逻辑 | 本 SDK 是浏览器端 SDK；后端请用后端方案 |
| 20 | 自己猜 OpenAPI 请求体字段 | 查 `sdk-docs/*Api.md` 或 `apis/*-api.ts` 类型 |

---

## 12. 生成代码前自检清单

Agent 输出 SMH 相关代码前必须确认：

- [ ] 使用 `import { SMHClient } from 'smh-js-sdk'`。
- [ ] 初始化使用 `new SMHClient({ basePath, libraryId, spaceId, accessToken })`。
- [ ] `basePath` 是用户专属域名占位，不是随便写死的公共域名。
- [ ] 没有在浏览器代码里出现 `librarySecret`。
- [ ] API 调用走 `client.<module>.<method>({ ... })` 或高层任务工厂。
- [ ] 返回值通过 `res.data` / 解构 `{ data }` 获取业务数据。
- [ ] 文件路径使用正斜杠，并清楚根目录是 `'/'`。
- [ ] 列表/搜索分页处理 `nextMarker`，除非接口明确不支持分页。
- [ ] 上传用 `createUploadTask`，下载保存用 `downloadByUrl`，下载处理用 `createDownloadTask`。
- [ ] 短链需求用 `file.infoFile({ info: 1, withShortLink: 1, period })`。
- [ ] 搜索需求已选对入口：关键词/全文用 `searchFs`，语义/文搜图用 `searchAI`，统计用 `searchFsStats`。
- [ ] 涉及异步任务时有 `queryTask` / `queryTaskV2` 轮询逻辑。
- [ ] 涉及 Delta 时有 cursor 持久化和过期回退说明。
- [ ] 错误处理使用 `SMHError`，没有混用 `ErrorCode` 和 `ServerErrorCode`。

---

## 13. 详细文档索引

按需查阅：

- [Started.md](./Started.md) - 快速开始与初始化
- [Uploader.md](./Uploader.md) - 高层上传任务
- [Downloader.md](./Downloader.md) - 高层下载任务
- [FileApi.md](./FileApi.md) - 文件详情、下载链接、短链、底层上传、增量同步、文件操作
- [DirectoryApi.md](./DirectoryApi.md) - 目录列表、详情、统计、创建、移动、删除
- [SearchApi.md](./SearchApi.md) - `searchFs` / `searchAI` / `searchFsStats`
- [share-api.ts](../apis/share-api.ts) - 分享链接 OpenAPI 类型与方法
- [hls-api.ts](../apis/hls-api.ts) - HLS/m3u8 与媒体处理 OpenAPI 类型与方法
- [BatchApi.md](./BatchApi.md) - 批量复制/移动/删除
- [TaskApi.md](./TaskApi.md) - 异步任务查询
- [SpaceApi.md](./SpaceApi.md) - 空间管理
- [QuotaApi.md](./QuotaApi.md) - 配额管理
- [UsageApi.md](./UsageApi.md) - 用量统计
- [FavoriteApi.md](./FavoriteApi.md) - 收藏
- [RecentApi.md](./RecentApi.md) - 最近使用
- [HistoryApi.md](./HistoryApi.md) - 历史版本
- [RecycledApi.md](./RecycledApi.md) - 回收站

可运行示例：

- [`demo/queue`](../demo/queue/) - Vite + React 上传队列 Demo，演示 `createUploadTask`、并发调度、暂停/恢复、断点续传、状态与进度订阅。

---

**本手册结束。Agent 在生成 SMH 代码时，应先按第 1 节路由能力，再套用第 2-10 节模板，最后执行第 12 节自检。**
