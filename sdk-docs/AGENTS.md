# smh-js-sdk · AI / Agent 快速上手手册

> 本文档面向 AI Coding Agent（Codex / Claude / CodeBuddy 等）。目标：**读完本文即可正确调用 SDK 生成可运行代码**，无需再翻其他文档。
> 人类开发者请阅读 [README.md](../README.md) 与 [sdk-docs/](./)。

---

## 0. TL;DR（30 秒速查）

- **包名**: `smh-js-sdk` · **入口**: `import { SMHClient } from 'smh-js-sdk'`
- **运行环境**: 浏览器（需 File API / ArrayBuffer / BigInt / WebAssembly）
- **所有 API 都挂在 `client.<module>` 下**：`client.directory` / `client.file` / `client.space` / ...
- **上传/下载用任务工厂**：`client.createUploadTask(...)` / `client.createDownloadTask(...)` / `client.downloadByUrl(...)`
- **参数自动注入**：`libraryId` / `spaceId` / `accessToken` 构造时传一次即可，后续调用**不要重复传**
- **错误统一是 `SMHError`**：优先读 `error.message`（已本地化），判断分支用 `error.code`

---

## 1. 初始化（唯一正确姿势）

```typescript
import { SMHClient } from 'smh-js-sdk'

const client = new SMHClient({
  basePath: 'https://smhxxx.api.tencentsmh.cn', // ⚠️ 必须是用户的专属域名
  libraryId: 'your-library-id',
  spaceId: 'your-space-id',                      // 可选：未指定时每个调用需手动传
  accessToken: 'your-access-token',              // ⚠️ 必须由后端签发，切勿前端生成 librarySecret
  maxRetries: 3,      // 可选
  retryDelay: 1000,   // 可选，指数退避
  timeout: 30000,     // 可选，ms
  // 推荐：token 过期自动续期
  // ⚠️ 下方 '/api/refresh-smh-token' 仅为示例接口名，实际应替换为业务后端提供的签发接口
  onTokenRefresh: async () => {
    const { accessToken } = await fetch('/api/refresh-smh-token').then(r => r.json())
    return accessToken
  },
})
```

**硬规则**：
1. `basePath` 不要硬编码写死某个公网域名，向用户索取专属域名。
2. `librarySecret`、创建 token、签发 token **永远在后端**。前端/SDK 只用 `accessToken`。
3. 有 `onTokenRefresh` 时，403 `InvalidAccessToken` 会自动续期 + 重试，业务侧不需要自己捕获重试。

---

## 2. API 速查表（模块 → 常用方法）

所有方法签名形式统一：`client.<module>.<method>({ ...params })`，返回 `Promise<AxiosResponse<T>>`，**真正业务数据在 `res.data`**。

| 模块 | 典型用途 | 高频方法 |
|---|---|---|
| `client.space` | 租户空间管理 | `listSpace` / `createSpace` / `deleteSpace` / `getSpace` |
| `client.directory` | 目录增删改查 & 统计 | `listDirectory` / `createDirectory` / `deleteDirectory` / `moveDirectory` / `copyDirectory` / `infoDirectory` / `getDirectoryStats` / `calibrateDirectoryStats` |
| `client.file` | 文件 CRUD & 增量同步 | `infoFile` / `deleteFile` / `moveFile` / `copyFile` / `getDeltaCursor` / `queryDeltaLog` |
| `client.batch` | 批量操作 | `batchDelete` / `batchMove` / `batchCopy` |
| `client.recycled` | 回收站 | `listRecycled` / `restoreRecycled` / `deleteRecycled` / `clearRecycled` |
| `client.history` | 历史版本 | `listHistory` / `deleteHistory` / `setHistoryAsLatest` |
| `client.search` | 全文/文件名搜索 | `searchFs` |
| `client.favorite` | 收藏 | `listFavorite` / `createFavorite` / `deleteFavorite` |
| `client.recent` | 最近使用 | `listRecent` |
| `client.task` | 异步任务轮询 | `queryTask` / `queryLibraryTask` / `querySpaceTask` |
| `client.quota` | 配额 | `createQuota` / `getQuota` / `updateQuota` |
| `client.usage` | 空间使用量 | `getLibraryUsage` / `batchGetSpaceUsage` |
| `client.share` | 分享链接 | `createShare` / `getShare` / `listShare` / `verifyShareCode` |
| `client.token` | Token 管理 | `createToken` / `renewToken` / `deleteToken` |
| `client.hls` | HLS 播放 | HLS 相关 |
| **文件上传** | 大文件分片/秒传/断点 | `client.createUploadTask(options)` |
| **文件下载** | 浏览器原生下载 | `client.downloadByUrl(options)` |
| **文件下载** | 分片下载 + Blob | `client.createDownloadTask(options)` |

详细参数请查 [FileApi.md](./FileApi.md) / [DirectoryApi.md](./DirectoryApi.md) 等对应文档。

---

## 3. 最小可运行样例

### 3.1 列目录

```typescript
const res = await client.directory.listDirectory({
  filePath: '/',          // 根目录用 '/'
  limit: 100,             // 可选，默认 100
  marker: undefined,      // 可选，分页游标
})
res.data.contents?.forEach(item => {
  console.log(item.name, item.type) // 'file' | 'dir'
})
```

### 3.2 创建/删除目录、文件

```typescript
await client.directory.createDirectory({ filePath: '/new-folder' })
await client.directory.deleteDirectory({ filePath: '/new-folder' })
await client.file.deleteFile({ filePath: '/a.txt' })
```

### 3.3 上传文件（浏览器 File 对象）

```typescript
const uploader = client.createUploadTask({
  filePath: '/remote/file.mp4',
  file: fileInput.files[0],        // 浏览器 File
  enableInstantUpload: true,       // 秒传
  chunkSize: 5,                    // MB
  parallel: 2,
  conflictResolutionStrategy: 'rename', // 'ask' | 'rename' | 'overwrite'
  onStateChange: (cp, state, err) => {
    // state: 'start' | 'computing_hash' | 'created' | 'running' | 'success' | 'paused' | 'error' | 'canceled'
    if (state === 'error' && err) console.error(err.message)
  },
  onProgress: ({ progress, speed, state }) => {
    console.log(`${state}: ${progress}%, ${speed} B/s`)
  },
})
await uploader.start()
// 交互控制（需要时）
// await uploader.pause()
// await uploader.start()   // 恢复（自动断点续传）
// await uploader.cancel()
```

### 3.4 下载文件

```typescript
// 【推荐】浏览器 URL 下载：不占内存，任意大小文件都 OK
await client.downloadByUrl({
  filePath: '/remote/file.pdf',
  fileName: 'saved-as.pdf', // 可选
})

// 需要拿到 Blob 做二次处理时：
const downloader = client.createDownloadTask({
  filePath: '/remote/file.bin',
  chunkSize: 5,
  parallel: 2,
})
const blob = await downloader.startAndGetBlob()
```

### 3.5 搜索

```typescript
const res = await client.search.searchFs({
  searchFsRequest: {
    keywords: ['keynote'],
    // 可选过滤项：scope, extensions, labels, ...
  },
})
```

### 3.6 批量操作

```typescript
await client.batch.batchDelete({
  batchDeleteRequest: {
    items: [
      { type: 'file', filePath: '/a.txt' },
      { type: 'dir',  filePath: '/folder1' },
    ],
  },
})
```

### 3.7 增量同步（Delta，新特性）

```typescript
// 1) 起点：取当前 cursor
const { data: { cursor: c0 } } = await client.file.getDeltaCursor({})

// 2) 拉取增量变更（hasMore=true 时循环）
let cursor = c0, hasMore = true
while (hasMore) {
  const { data } = await client.file.queryDeltaLog({ cursor })
  for (const event of data.contents ?? []) {
    // event.eventType: 'create' | 'modify' | 'delete' | 'move' | 'copy' | 'recycle' | ...
    // event.location: 0=普通 / 1=回收站 / 2=历史 / 3=软删除
    // 处理 event …
  }
  cursor = data.cursor
  hasMore = data.hasMore
}
// 3) cursor 需要业务侧持久化，下次续传传入
// 4) cursor 有效期 180 天；若服务端返回 CursorExpired，需要重新 getDeltaCursor + 全量列目录
```

### 3.8 目录统计（新特性）

```typescript
const res = await client.directory.getDirectoryStats({
  filePath: '/my-project',
  stats: 1,               // 固定 1（OpenAPI 生成器要求；不要省略）
  statsType: 'normal',    // 'normal' | 'recycle' | 'history'
})
console.log(res.data.storage, res.data.fileCount, res.data.dirCount)

// 如果怀疑统计偏差（异步矫正，需 admin/space_admin 权限，有频控）
const { data: { taskId } } = await client.directory.calibrateDirectoryStats({
  filePath: '/my-project',
  calibrate: 1,
  statsType: 'normal',
})
// 轮询任务
const t = await client.task.queryTask({ taskId })
```

---

## 4. 错误处理（必须遵守）

所有异常都是 `SMHError`，**永远 `instanceof SMHError` 判断**：

```typescript
import { SMHError, ErrorCode, ServerErrorCode } from 'smh-js-sdk'

try {
  await client.file.infoFile({ filePath: '/x.txt', info: 1 })
} catch (e) {
  if (e instanceof SMHError) {
    // 1) 展示给用户：直接用 e.message（SDK 已做本地化映射）
    alert(e.message)

    // 2) 业务分支：用 e.code（稳定的 SDK 码）
    if (e.code === ErrorCode.NETWORK_ERROR) { /* 断网/超时/DNS */ }
    if (e.code === ErrorCode.SERVER_ERROR)  { /* 5xx */ }

    // 3) 更细分：e.response?.serverCode（服务端原始码）
    if (e.response?.serverCode === ServerErrorCode.QuotaLimitReached) { /* 配额满 */ }

    // 4) 排障信息
    console.log(e.status, e.reqId, e.response?.serverCode)
  }
}
```

**常用 `ErrorCode`**（完整见 README）：
`NetworkError` · `ServerError` · `RequestTimeout` · `FileNotFound` · `FileTooLarge` · `UploadFailed` · `UploadCanceled` · `UploadPaused` · `DownloadFailed` · `InvalidParameter` · `OperationFailed`

**Uploader/Downloader 状态机**（`onStateChange`）：
`start → computing_hash → created → running → success`；中途可能 `paused` / `canceled` / `error`。

---

## 5. Agent 容易踩的坑 ⚠️

| # | 陷阱 | 正确做法 |
|---|---|---|
| 1 | 重复传 `libraryId`/`spaceId`/`accessToken` | 构造时传一次即可，API 调用只传业务参数 |
| 2 | 在前端写 `createToken` / `librarySecret` | 一律后端；前端只用 `accessToken` + `onTokenRefresh` |
| 3 | 用 `axios` 或 `fetch` 手撸接口 | 用 `client.<module>.<method>`，不然没有重试/续期/错误包装 |
| 4 | `filePath` 忘了带前导 `/` 或含反斜杠 `\` | 统一正斜杠 `/`；根目录用 `'/'` |
| 5 | 上传时把 `file` 传成 `Blob` 而不是 `File` | 必须是浏览器 `File` 对象（有 `name`） |
| 6 | 期望 `await client.xxx.yyy()` 直接拿到数据 | 返回的是 `AxiosResponse`，业务数据在 `.data` |
| 7 | `downloadByUrl` 后手动再处理 Blob | `downloadByUrl` 已触发浏览器下载，返回 `void`；要 Blob 请用 `createDownloadTask` |
| 8 | 忽略分页 | `list*` 类接口返回 `nextMarker`，需要循环拉直到没有 marker |
| 9 | `getDirectoryStats` 漏传 `stats: 1` | 这是 OpenAPI 生成器产物，**必填常量 1** |
| 10 | Delta cursor 不持久化 | 必须存起来，否则每次都是全量；过期要回退到 `getDeltaCursor` |
| 11 | 把 `ServerErrorCode` 当成 `ErrorCode` 用 | 两套码：`error.code` 用 `ErrorCode`；`error.response.serverCode` 用 `ServerErrorCode` |
| 12 | Node 环境使用 SDK | **仅支持浏览器**；Node 端请用后端 SDK |

---

## 6. 生成代码的硬性约束（Agent 自检清单）

在给用户输出代码前，Agent **必须**确认：

- [ ] `import { SMHClient } from 'smh-js-sdk'` 已写
- [ ] 用到了 `new SMHClient({...})` 初始化，`basePath` 是专属域名占位（不要用任意公网域名）
- [ ] `accessToken` 的来源说明是"后端签发"，**不**出现 `librarySecret` 在前端
- [ ] API 调用走 `client.<module>.<method>(...)`，不绕过 SDK 用 `axios`/`fetch`
- [ ] 对返回值用 `res.data` 取业务数据
- [ ] `try/catch` + `instanceof SMHError`，至少展示 `e.message`
- [ ] 上传/下载任务写了 `onStateChange` 或 `onProgress`（否则没法暴露进度/错误）
- [ ] `filePath` 都是 `/` 开头、正斜杠路径
- [ ] 涉及分页时处理了 `nextMarker`
- [ ] 涉及 Delta 时处理了 `hasMore` 循环 + `CursorExpired` 回退

---

## 7. 进阶模板（复制即用）

### 7.1 带 Token 自动续期的完整初始化

```typescript
import { SMHClient, SMHError, ErrorCode } from 'smh-js-sdk'

export function createClient(opts: {
  basePath: string
  libraryId: string
  spaceId: string
  getToken: () => Promise<string>
}) {
  return new SMHClient({
    basePath: opts.basePath,
    libraryId: opts.libraryId,
    spaceId: opts.spaceId,
    accessToken: '', // 初始可留空，onTokenRefresh 首次触发会填
    maxRetries: 3,
    timeout: 30000,
    onTokenRefresh: opts.getToken,
  })
}
```

### 7.2 带进度 UI 的上传封装

```typescript
export async function upload(
  client: SMHClient,
  file: File,
  remotePath: string,
  onProgress?: (pct: number) => void,
) {
  const task = client.createUploadTask({
    filePath: remotePath,
    file,
    enableInstantUpload: true,
    conflictResolutionStrategy: 'rename',
    onProgress: (info) => onProgress?.(info.progress),
    onStateChange: (_cp, state, err) => {
      if (state === 'error' && err) throw err
    },
  })
  await task.start()
}
```

### 7.3 递归列目录（处理分页）

```typescript
export async function listAll(client: SMHClient, dir: string) {
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

---

## 8. 详细 API 参数定义

按需查阅（均为相对本目录的相对路径）：

- [FileApi.md](./FileApi.md)
- [DirectoryApi.md](./DirectoryApi.md)
- [SpaceApi.md](./SpaceApi.md)
- [BatchApi.md](./BatchApi.md)
- [RecycledApi.md](./RecycledApi.md)
- [HistoryApi.md](./HistoryApi.md)
- [SearchApi.md](./SearchApi.md)
- [FavoriteApi.md](./FavoriteApi.md)
- [RecentApi.md](./RecentApi.md)
- [TaskApi.md](./TaskApi.md)
- [QuotaApi.md](./QuotaApi.md)
- [UsageApi.md](./UsageApi.md)
- [Uploader.md](./Uploader.md)
- [Downloader.md](./Downloader.md)
- [Started.md](./Started.md)

---

**本手册结束。Agent 在此之后生成的任何 SMH 相关代码都应完整符合第 6 节自检清单。**
