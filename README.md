# SMH JS SDK

腾讯云智能媒资托管服务（SMH）浏览器端 JavaScript/TypeScript SDK，提供文件上传、下载、秒传、目录管理等完整功能。

## 安装

```bash
npm install smh-js-sdk
```

## 前提条件

- 浏览器需支持 File API、ArrayBuffer、Fetch API、BigInt、WebAssembly
- 已开通腾讯云智能媒资托管服务
- 已通过业务后端获取 accessToken、libraryId、spaceId

## 快速开始

> **访问域名**：在 [控制台](https://console.cloud.tencent.com/smh) 创建媒体库后，控制台会展示为您生成的专属域名（格式为 `<libraryId>.api.tencentsmh.cn`），请将该域名作为 `basePath` 使用。
>
> 完整的使用示例请参考 [Demo 项目](#demo-项目)。

```typescript
import { SMHClient } from 'smh-js-sdk'

const client = new SMHClient({
  basePath: 'https://<your-library-id>.api.tencentsmh.cn',
  libraryId: 'your-library-id',
  spaceId: 'your-space-id',
  accessToken: 'your-access-token',
})
```

### 文件上传

```typescript
const uploader = client.createUploadTask({
  filePath: '/remote/path/file.txt',
  file: fileInput.files[0],
  enableInstantUpload: true,
  chunkSize: 5,
  parallel: 2,

  onStateChange: (checkpoint, state, error) => {
    console.log('状态:', state) // start → computing_hash → created → running → success
  },
  onProgress: (info) => {
    console.log(`进度: ${info.progress}%, 速度: ${info.speed} B/s`)
  },
  onPartComplete: (checkpoint, partInfo) => {
    console.log(`分片 ${partInfo.part_number} 完成`)
  }
})

await uploader.start()

// 暂停 / 恢复 / 取消
await uploader.pause()
await uploader.start() // 恢复（自动断点续传）
await uploader.cancel()
```

### 文件下载

#### 方式一：浏览器 URL 下载（推荐）

不占用内存，适合任意大小的文件：

```typescript
await client.downloadByUrl({
  filePath: '/remote/path/file.pdf',
  fileName: '自定义文件名.pdf'  // 可选，不传则使用远端文件名
})
```

#### 方式二：内存下载

文件内容下载到内存中（Blob），适合需要二次处理的场景：

```typescript
const downloader = client.createDownloadTask({
  filePath: '/remote/path/file.txt',
  chunkSize: 5,
  parallel: 2,

  onStateChange: (checkpoint, state, error) => {
    console.log('状态:', state)
  },
  onProgress: (info) => {
    console.log(`进度: ${info.progress}%`)
  }
})

const blob = await downloader.startAndGetBlob() // 返回 Blob 对象

// 暂停 / 恢复 / 取消
await downloader.pause()
await downloader.start() // 恢复（自动断点续传）
await downloader.cancel()
```

### API 调用

```typescript
// 列出目录
const result = await client.directory.listDirectory({
  filePath: '/',
  limit: 100
})

// 创建目录
await client.directory.createDirectory({
  filePath: '/new-folder'
})

// 删除文件
await client.file.deleteFile({
  filePath: '/path/to/file.txt'
})

// 搜索文件
const searchResult = await client.search.createSearch({
  createSearchRequest: { keyword: 'test' }
})
```

## 功能特性

### 上传

- **简单上传** — 小于 32MB 的文件直接上传
- **分片上传** — 大文件自动分块并发上传
- **秒传检测** — 通过 SHA256 链式哈希匹配服务端已有文件，跳过实际传输
- **断点续传** — 通过 checkpoint 保存/恢复上传进度
- **CRC64 校验** — 上传完成后进行数据完整性校验
- **自动续期** — 签名过期前自动续期
- **冲突策略** — 支持 `ask` / `rename` / `overwrite`

### 下载

- **简单下载** — 小文件流式下载
- **分片下载** — 大文件 Range 请求并发下载
- **断点续传** — 保存/恢复下载进度
- **CRC64 校验** — 下载完成后校验数据完整性
- **浏览器 URL 下载** — 通过 `<a>` 标签触发浏览器原生下载，不占用内存，适合任意大小文件

### API

| 模块 | 功能 |
|------|------|
| **FileApi** | 文件上传（简单/分片/表单）、下载、复制、移动、删除、详情查询 |
| **DirectoryApi** | 目录创建、列表、复制、移动、删除、标签管理 |
| **BatchApi** | 批量复制、移动、删除 |
| **SpaceApi** | 空间创建、列表、扩展信息、容量查询、删除 |

> **删除空间注意事项**：`deleteSpace` 要求传入的 `accessToken` 必须是**针对待删除空间签发的**。如果当前 client 的 token 是绑定到其他 spaceId 的，需要先用 `createToken` 为目标 spaceId 重新签发一个 token，再将其通过 `accessToken` 参数传入：
>
> ```typescript
> // 1. 创建空间
> const createRes = await client.space.createSpace({
>   createSpaceRequest: { spaceTag: 'my_space' },
> });
> const newSpaceId = createRes.data.spaceId;
>
> // 2. 为新空间签发专属 token
> const tokenRes = await client.token.createToken({
>   libraryId: 'your-library-id',
>   librarySecret: 'your-library-secret',
>   spaceId: newSpaceId,
>   userId: 'your-user-id',
>   grant: 'admin',
> });
> const newToken = tokenRes.data.accessToken;
>
> // 3. 使用新 token 删除空间
> await client.space.deleteSpace({
>   spaceId: newSpaceId,
>   accessToken: newToken,
>   force: 1,
> });
> ```
| **SearchApi** | 文件搜索 |
| **RecycledApi** | 回收站列表、恢复、删除 |
| **HistoryApi** | 历史版本管理 |
| **FavoriteApi** | 收藏管理 |
| **TokenApi** | 访问令牌创建、续期、删除 |
| **QuotaApi** | 配额管理 |
| **TaskApi** | 异步任务状态查询 |
| **UsageApi** | 用量统计 |
| **RecentApi** | 最近使用的文件 |

## 上传配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `libraryId` | string | (必填) | 媒体库 ID |
| `spaceId` | string | (必填) | 空间 ID |
| `filePath` | string | (必填) | 远端目标路径 |
| `file` | File | (必填) | 浏览器 File 对象 |
| `accessToken` | string | (必填) | 访问令牌 |
| `userId` | string | - | 用户 ID |
| `chunkSize` | number | 5 | 分块大小 (MB) |
| `parallel` | number | 2 | 并发数 |
| `partFileSize` | number | 32 | 分片上传阈值 (MB)，范围 1~5120 |
| `enableInstantUpload` | boolean | true | 是否启用秒传 |
| `trafficLimit` | number | - | 单链接限速 (100KB/s ~ 100MB/s) |
| `conflictResolutionStrategy` | string | - | 冲突策略：`ask` / `rename` / `overwrite` |
| `checkpoint` | UploadCheckpoint | - | 断点续传 checkpoint |
| `verbose` | boolean | false | 详细日志 |

## 下载配置项

### `downloadByUrl` 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `filePath` | string | (必填) | 远端文件路径 |
| `fileName` | string | - | 自定义下载文件名，不传则使用远端文件名 |
| `libraryId` | string | - | 媒体库 ID（已在 client 配置时可省略） |
| `spaceId` | string | - | 空间 ID（已在 client 配置时可省略） |
| `accessToken` | string | - | 访问令牌（已在 client 配置时可省略） |
| `userId` | string | - | 用户 ID |

### `createDownloadTask` 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `filePath` | string | (必填) | 远端文件路径 |
| `chunkSize` | number | 5 | 分块大小 (MB) |
| `parallel` | number | 2 | 并发数 |
| `partFileSize` | number | 32 | 分块下载阈值 (MB) |
| `trafficLimit` | number | - | 单链接限速 |
| `checkpoint` | DownloadCheckpoint | - | 断点续传 checkpoint |
| `verbose` | boolean | false | 详细日志 |

## Demo 项目

`demo/` 目录下提供了一个完整的浏览器端演示应用，包含文件上传（含秒传）、下载、目录浏览等功能。

### 运行 Demo

```bash
# 1. 先在 SDK 根目录安装依赖并构建
npm install
npm run build

# 2. 进入 demo 目录安装依赖
cd demo
npm install

# 3. 启动开发服务器
npm run dev
```

启动后在浏览器中打开 `http://localhost:5173`，在页面顶部配置区填入 `Library ID`、`Space ID`、`Access Token` 和 `Base Path`，即可体验上传、下载和文件列表功能。

### Demo 功能

- **文件上传** — 选择本地文件，支持分片上传、秒传检测、暂停/恢复/取消，实时显示进度和速度
- **文件下载** — 支持内存下载（分片下载、暂停/恢复/取消）和浏览器 URL 直接下载两种方式
- **目录浏览** — 列出指定路径下的文件和目录，点击目录可进入，点击文件可快速填充下载路径
- **日志面板** — 实时展示 SDK 内部日志和操作记录

### Demo 项目结构

```
demo/
├── index.html          # 页面入口
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts         # 主入口，初始化 SMHClient 并串联各模块
    ├── config.ts       # 配置管理，创建 SMHClient 实例
    ├── upload.ts       # 上传管理器
    ├── download.ts     # 下载管理器
    ├── file-list.ts    # 目录浏览管理器
    ├── logger.ts       # 日志面板
    ├── utils.ts        # 工具函数
    └── styles.css      # 样式
```