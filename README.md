# SMH JS SDK

腾讯云智能媒资托管（Smart Media Hosting，SMH）浏览器端 JavaScript/TypeScript SDK，为开发者提供便捷的浏览器端接口来访问和管理腾讯云 SMH 服务，支持文件上传（含秒传、分片、断点续传）、下载、目录管理等完整功能。

## 前提条件

- 浏览器需支持 File API、ArrayBuffer、BigInt、WebAssembly
- 已开通腾讯云智能媒资托管服务
- 已获取媒体库 ID（libraryId）和访问令牌（accessToken，由后端服务签发）

## 安装

使用 npm：

```bash
npm install smh-js-sdk
```

使用 yarn：

```bash
yarn add smh-js-sdk
```

使用 pnpm：

```bash
pnpm add smh-js-sdk
```

## 快速开始

### 1. 引入 SDK

```typescript
// ES Module（推荐）
import { SMHClient } from 'smh-js-sdk'

// CommonJS
const { SMHClient } = require('smh-js-sdk')
```

### 2. 初始化 SMHClient

```typescript
const client = new SMHClient({
  basePath: 'https://smhxxx.api.tencentsmh.cn', // 专属域名（推荐）
  libraryId: 'your-library-id',
  spaceId: 'your-space-id',
  accessToken: 'your-access-token',  // 由后端服务创建
  maxRetries: 3,  // 可选，请求失败重试次数，默认 3
  timeout: 30000, // 可选，请求超时时间（毫秒），默认 30000
})
```

> **basePath 专属域名获取方式**：在 [腾讯云智能媒资托管控制台](https://console.cloud.tencent.com/smh) 创建媒体库后，控制台会展示为您生成的专属域名（如 `smhxxx.api.tencentsmh.cn`）。**强烈建议**将 `basePath` 设置为您的专属域名，以获得更好的访问性能和稳定性。

> **安全提示**：`librarySecret` 属于敏感凭据，**切勿在浏览器端暴露**。创建访问令牌（`createToken`）应在后端服务中完成，前端仅使用后端签发的 `accessToken`。

初始化后，后续调用 API 时无需每次都传入 `libraryId`、`spaceId`、`accessToken`，SDK 会自动注入。

### 3. AccessToken 续期

`accessToken` 有有效期限制（默认 24 小时），过期后需要调用 `renewToken` 进行续期：

```typescript
const renewResponse = await client.token.renewToken({
  libraryId: 'your-library-id',
  accessToken: accessToken,
})

const newAccessToken = renewResponse.data.accessToken

// 更新默认 accessToken
client.setDefaultAccessToken(newAccessToken)
```

> **注意**：建议在业务逻辑中提前进行续期以避免请求失败。

### 4. 使用 API

```typescript
// 列出目录内容
const contents = await client.directory.listDirectory({
  filePath: '/',
  limit: 100,
})
console.log('目录内容:', contents.data)

// 创建目录
await client.directory.createDirectory({
  filePath: '/new-folder',
})

// 删除文件
await client.file.deleteFile({
  filePath: '/path/to/file.txt',
})

// 搜索文件
const searchResult = await client.search.searchFs({
  searchFsRequest: { keywords: ['test'] },
})
```

### 5. 文件上传

```typescript
const uploader = client.createUploadTask({
  filePath: '/remote/path/file.txt',
  file: fileInput.files[0],       // 浏览器 File 对象
  enableInstantUpload: true,       // 启用秒传
  chunkSize: 5,                    // 分块大小 5MB
  parallel: 2,                     // 2 并发

  onStateChange: (checkpoint, state, error) => {
    console.log('状态:', state)    // start → computing_hash → created → running → success
  },
  onProgress: (info) => {
    console.log(`进度: ${info.progress}%, 速度: ${info.speed} B/s`)
  },
  onPartComplete: (checkpoint, partInfo) => {
    console.log(`分片 ${partInfo.part_number} 完成`)
  },
})

await uploader.start()

// 暂停 / 恢复 / 取消
await uploader.pause()
await uploader.start()   // 恢复（自动断点续传）
await uploader.cancel()
```

### 6. 文件下载

#### 方式一：浏览器 URL 下载（推荐）

通过 `<a>` 标签触发浏览器原生下载，不占用内存，适合任意大小的文件：

```typescript
await client.downloadByUrl({
  filePath: '/remote/path/file.pdf',
  fileName: '自定义文件名.pdf',  // 可选，不传则使用远端文件名
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
  },
})

const blob = await downloader.startAndGetBlob()  // 返回 Blob 对象

// 暂停 / 恢复 / 取消
await downloader.pause()
await downloader.start()   // 恢复（自动断点续传）
await downloader.cancel()
```

## SMHClient 初始化参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `basePath` | string | - | API 基础路径，推荐使用专属域名 |
| `libraryId` | string | - | 媒体库 ID |
| `spaceId` | string | - | 空间 ID |
| `accessToken` | string | - | 访问令牌 |
| `maxRetries` | number | 3 | 请求失败重试次数（仅对网络错误和 5xx 错误重试） |
| `retryDelay` | number | 1000 | 重试基础延迟（毫秒），使用指数退避策略 |
| `timeout` | number | 30000 | 请求超时时间（毫秒） |
| `baseOptions` | object | - | 传递给 axios 的额外配置 |

## 主要功能

### 上传功能

- **简单上传** — 小于 32MB 的文件直接上传
- **分片上传** — 大文件自动分块并发上传
- **秒传检测** — 通过 SHA256 链式哈希匹配服务端已有文件，跳过实际传输
- **断点续传** — 通过 checkpoint 保存/恢复上传进度
- **CRC64 校验** — 上传完成后进行数据完整性校验
- **自动续期** — 签名过期前自动续期
- **冲突策略** — 支持 `ask` / `rename` / `overwrite`

### 下载功能

- **浏览器 URL 下载** — 通过 `<a>` 标签触发浏览器原生下载，不占用内存，适合任意大小文件
- **简单下载** — 小文件流式下载
- **分片下载** — 大文件 Range 请求并发下载
- **断点续传** — 保存/恢复下载进度
- **CRC64 校验** — 下载完成后校验数据完整性

### 空间管理

- 创建/删除租户空间
- 列出空间列表
- 获取空间信息（文件数量、空间大小、扩展信息）
- 获取空间内容视图
- 设置空间流量限制
- 更新空间扩展信息

### 目录管理

- 列出目录内容（支持分页）
- 创建目录
- 删除目录（支持永久删除）
- 移动/重命名目录
- 复制目录
- 检查目录状态
- 获取目录或文件详细信息
- 更新目录/文件标签

### 文件管理

- **上传文件** — 简单上传、表单上传、分片上传、断点续传
- **下载文件** — 直接下载、获取文件信息、获取文件预览、获取文件封面
- **文件操作** — 删除、移动/重命名、复制、创建符号链接、文件转码、检查状态、根据 inode 获取文件信息、查询文件删除原因

### 回收站管理（RecycledApi）

- 列出回收站内容
- 恢复回收站项目（单个/批量）
- 永久删除回收站项目（单个/批量）
- 清空回收站
- 获取回收站项目信息
- 预览回收站文件
- 设置回收站生命周期

### 历史版本管理（HistoryApi）

- 列出文件历史版本
- 删除历史版本
- 设置历史版本为最新版本
- 获取/设置历史版本配置
- 清空历史版本

### 分享管理（ShareApi）

- 创建分享链接
- 删除分享
- 获取分享详情
- 获取分享链接详情
- 列出分享列表
- 搜索分享
- 更新分享设置
- 启用/禁用分享
- 验证提取码
- 列出分享文件
- 下载分享文件
- 预览分享文件
- 保存分享文件到个人空间

### 搜索功能（SearchApi）

- 搜索目录与文件（支持分页）

### 收藏管理（FavoriteApi）

- 收藏文件/目录
- 取消收藏
- 列出收藏列表

### 最近使用（RecentApi）

- 查看最近使用文件列表

### 批量操作（BatchApi）

- 批量复制文件/目录
- 批量移动文件/目录
- 批量删除文件/目录

### 任务管理（TaskApi）

- 查询异步任务状态
- 查询媒体库级别任务
- 查询空间级别任务

### 配额管理（QuotaApi）

- 创建配额
- 获取租户空间配额
- 获取配额详细信息
- 更新配额（按空间 ID 或配额 ID）

### 使用量统计（UsageApi）

- 查询媒体库容量信息
- 批量查询租户空间容量信息

## 上传配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `filePath` | string | (必填) | 远端目标路径 |
| `file` | File | (必填) | 浏览器 File 对象 |
| `chunkSize` | number | 5 | 分块大小 (MB) |
| `parallel` | number | 2 | 并发数 |
| `partFileSize` | number | 32 | 分片上传阈值 (MB)，范围 1~5120 |
| `enableInstantUpload` | boolean | true | 是否启用秒传 |
| `trafficLimit` | number | - | 单链接限速 (100KB/s ~ 100MB/s) |
| `conflictResolutionStrategy` | string | - | 冲突策略：`ask` / `rename` / `overwrite` |
| `checkpoint` | UploadCheckpoint | - | 断点续传 checkpoint |
| `verbose` | boolean | false | 详细日志 |
| `onStateChange` | function | - | 状态变更回调 |
| `onProgress` | function | - | 进度回调 |
| `onPartComplete` | function | - | 分片完成回调 |

> 通过 `client.createUploadTask()` 创建时，`libraryId`、`spaceId`、`accessToken` 会自动从 client 注入，无需手动传入。

## 下载配置项

### `downloadByUrl` 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `filePath` | string | (必填) | 远端文件路径 |
| `fileName` | string | - | 自定义下载文件名，不传则使用远端文件名 |

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
| `onStateChange` | function | - | 状态变更回调 |
| `onProgress` | function | - | 进度回调 |
| `onPartComplete` | function | - | 分片完成回调 |

> 通过 `client.createDownloadTask()` 或 `client.downloadByUrl()` 创建时，`libraryId`、`spaceId`、`accessToken` 会自动从 client 注入，无需手动传入。

## Demo 项目

我们提供了一个独立的浏览器端演示应用，覆盖 SDK 的全部功能模块。

Demo 仓库地址：[smh-js-sdk-demo](https://git.woa.com/smh/smh-js-sdk-demo)

### 演示功能

- 文件上传（分片、秒传、暂停/续传）
- 文件下载（分片下载、浏览器 URL 下载）
- 文件列表与目录浏览
- 文件操作（重命名、复制、移动、删除）
- 目录操作（创建、重命名、复制、移动、删除）
- 搜索、批量操作、回收站、历史版本、收藏
- 分享管理（创建/查看/删除分享、验证提取码）
- 空间管理、Token 管理


## 文档

更多详细文档请参考：

- [API 文档](https://cloud.tencent.com/document/product/1339)

## 许可证

本项目采用 ISC 许可证。

## 相关链接

- [腾讯云智能媒资托管](https://cloud.tencent.com/product/smh)
- [产品文档](https://cloud.tencent.com/document/product/1339)
- [控制台](https://console.cloud.tencent.com/smh)

## 支持

如有问题或建议，欢迎：

- 提交 Issue
- 查看官方文档
- 联系腾讯云技术支持