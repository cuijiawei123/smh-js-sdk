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

### 基本配置

```typescript
import { Configuration, SMHClient } from 'smh-js-sdk'

const configuration = new Configuration({
  basePath: 'https://api.tencentsmh.cn'
})

const client = new SMHClient({
  basePath: 'https://api.tencentsmh.cn',
  libraryId: 'your-library-id',
  spaceId: 'your-space-id',
  accessToken: 'your-access-token',
})
```

### 文件上传

```typescript
import { Uploader, Configuration } from 'smh-js-sdk'

const configuration = new Configuration({
  basePath: 'https://api.tencentsmh.cn'
})

const uploader = new Uploader({
  libraryId: 'your-library-id',
  spaceId: 'your-space-id',
  filePath: '/remote/path/file.txt',
  file: fileInput.files[0], // 浏览器 File 对象
  accessToken: 'your-access-token',
  enableInstantUpload: true, // 启用秒传
  chunkSize: 5,              // 分块大小 (MB)
  parallel: 2,               // 并发数

  onStateChange: (checkpoint, state, error) => {
    console.log('状态:', state) // start → computing_hash → created → running → success
  },
  onProgress: (info) => {
    console.log(`进度: ${info.progress}%, 速度: ${info.speed} B/s`)
  },
  onPartComplete: (checkpoint, partInfo) => {
    console.log(`分片 ${partInfo.part_number} 完成`)
  }
}, configuration)

await uploader.start()

// 暂停 / 恢复 / 取消
await uploader.pause()
await uploader.start() // 恢复（自动断点续传）
await uploader.cancel()
```

### 文件下载

```typescript
import { Downloader, Configuration } from 'smh-js-sdk'

const configuration = new Configuration({
  basePath: 'https://api.tencentsmh.cn'
})

const downloader = new Downloader({
  libraryId: 'your-library-id',
  spaceId: 'your-space-id',
  filePath: '/remote/path/file.txt',
  accessToken: 'your-access-token',
  chunkSize: 5,
  parallel: 2,

  onStateChange: (checkpoint, state, error) => {
    console.log('状态:', state)
  },
  onProgress: (info) => {
    console.log(`进度: ${info.progress}%`)
  }
}, configuration)

const blob = await downloader.start() // 返回 Blob 对象
```

### 使用 SMHClient 调用 API

```typescript
// 列出目录
const result = await client.directoryApi.listDirectory({
  filePath: '/',
  limit: 100
})

// 创建目录
await client.directoryApi.createDirectory({
  filePath: '/new-folder'
})

// 删除文件
await client.fileApi.deleteFile({
  filePath: '/path/to/file.txt'
})

// 搜索文件
const searchResult = await client.searchApi.createSearch({
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

### API

| 模块 | 功能 |
|------|------|
| **FileApi** | 文件上传（简单/分片/表单）、下载、复制、移动、删除、详情查询 |
| **DirectoryApi** | 目录创建、列表、复制、移动、删除、标签管理 |
| **BatchApi** | 批量复制、移动、删除 |
| **SpaceApi** | 空间创建、列表、扩展信息、容量查询 |
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

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `libraryId` | string | (必填) | 媒体库 ID |
| `spaceId` | string | (必填) | 空间 ID |
| `filePath` | string | (必填) | 远端文件路径 |
| `accessToken` | string | (必填) | 访问令牌 |
| `userId` | string | - | 用户 ID |
| `chunkSize` | number | 5 | 分块大小 (MB) |
| `parallel` | number | 2 | 并发数 |
| `partFileSize` | number | 32 | 分块下载阈值 (MB) |
| `trafficLimit` | number | - | 单链接限速 |
| `checkpoint` | DownloadCheckpoint | - | 断点续传 checkpoint |

## 上传状态流转

```
waiting → start → computing_hash → created → running → confirming → success
                                                                  ↗
                     (秒传匹配) → rapid_success ────────────────────

任意阶段 → paused / error / canceled
```

## 构建

```bash
# 安装依赖
npm install

# 构建（输出 CommonJS + ESM）
npm run build

# 运行 Demo
cd demo && npm install && npm run dev
```

## 技术栈

- TypeScript
- axios — HTTP 请求
- hash-wasm — WebAssembly SHA256 哈希计算
- esbuild — ESM 浏览器包构建
- OpenAPI Generator — API 层和数据模型自动生成

## 环境要求

- Node.js >= 16.0.0
- 浏览器需支持 `File.slice()`、`ArrayBuffer`、`XMLHttpRequest`、`Fetch API`、`BigInt`
