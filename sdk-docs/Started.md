# SMH JS SDK 快速入门

腾讯云智能媒资托管（Smart Media Hosting，SMH）JS SDK，为开发者提供便捷的浏览器端 JavaScript/TypeScript 接口来访问和管理腾讯云 SMH 服务。

## 前提条件

- 浏览器需支持 File API、ArrayBuffer、BigInt、WebAssembly
- 已开通腾讯云智能媒资托管服务
- 已获取媒体库 ID（libraryId）和访问令牌（accessToken，由后端服务签发）

> **浏览器兼容性**：推荐使用 Chrome 67+、Firefox 68+、Safari 14+、Edge 79+ 等现代浏览器。

## 安装

使用 npm：

```bash
npm install @tencent/smh-js-sdk
```

使用 yarn：

```bash
yarn add @tencent/smh-js-sdk
```

使用 pnpm：

```bash
pnpm add @tencent/smh-js-sdk
```

## 快速开始

### 1. 引入 SDK

```typescript
// ES Module（推荐）
import { SMHClient } from '@tencent/smh-js-sdk';

// CommonJS
const { SMHClient } = require('@tencent/smh-js-sdk');
```

### 2. 初始化 SMHClient

由于浏览器环境无法安全保存 `librarySecret`，JS SDK **不提供** `createToken` 方法。请由后端服务（如 Node.js SDK）创建访问令牌后传给前端使用：

```typescript
const smh = new SMHClient({
    basePath: 'https://smhxxx.api.tencentsmh.cn', // 专属域名（推荐）
    accessToken: 'your-access-token',  // 由后端服务创建
    libraryId: 'your-library-id',
    spaceId: 'your-space-id',
});
```

> **basePath 专属域名获取方式**：在 [腾讯云智能媒资托管控制台](https://console.cloud.tencent.com/smh) 创建媒体库后，控制台会展示为您生成的专属域名（如 `smhxxx.api.tencentsmh.cn`）。**强烈建议**将 `basePath` 设置为您的专属域名，以获得更好的访问性能和稳定性。

> **安全提示**：`librarySecret` 属于敏感凭据，**切勿在浏览器端暴露**。创建访问令牌（`createToken`）应在后端服务中完成，前端仅使用后端签发的 `accessToken`。

初始化后，后续调用 API 时无需每次都传入 `libraryId`、`spaceId`、`accessToken`，SDK 会自动注入。

### SMHClient 初始化参数

| 参数名 | 参数描述 | 类型 | 是否必填 | 默认值 |
|--------|----------|------|----------|--------|
| basePath | API 服务地址（推荐使用专属域名） | String | 否 | - |
| accessToken | 访问令牌 | String | 否 | - |
| libraryId | 媒体库 ID | String | 否 | - |
| spaceId | 空间 ID | String | 否 | - |
| maxRetries | 请求失败最大重试次数 | Number | 否 | 3 |
| retryDelay | 重试基础延迟时间（毫秒） | Number | 否 | 1000 |
| timeout | 请求超时时间（毫秒） | Number | 否 | 30000 |
| baseOptions | axios 基础配置项 | Object | 否 | - |

这样初始化后，后续调用 API 时无需每次都传入 `libraryId`、`spaceId`、`accessToken`，SDK 会自动注入。

### 3. AccessToken 续期

`accessToken` 有有效期限制（默认 24 小时），过期后需要调用 `renewToken` 进行续期：

```typescript
// 检查 token 是否即将过期，如过期则续期
const renewResponse = await smh.token.renewToken({
    libraryId: libraryId,
    accessToken: accessToken,
});

const newAccessToken = renewResponse.data.accessToken;
const newExpiresIn = renewResponse.data.expiresIn;

// 更新默认 accessToken
smh.setDefaultAccessToken(newAccessToken);

console.log('Token 续期成功，新的有效期:', newExpiresIn, '秒');
```

> **注意**：建议在业务逻辑中提前进行续期以避免请求失败。

### 4. 使用 API

```typescript
// 列出目录内容
const contents = await smh.directory.listDirectory({
    spaceId: 'your-space-id',
    filePath: '/',
    page: 1,
    pageSize: 20
});

console.log('目录内容:', contents.data);
```

### 5. 上传文件

JS SDK 支持直接在浏览器中上传文件，接受浏览器原生 `File` 对象：

```typescript
// 通过 <input> 获取用户选择的文件
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// 创建上传任务（同步方法，无需 await）
const uploader = smh.createUploadTask({
    filePath: `/uploads/${file.name}`,
    file: file,  // 浏览器 File 对象
});

// 监听上传进度
uploader.on('progress', (progress) => {
    console.log(`上传进度: ${progress.progress}%`);
});

// 开始上传
await uploader.start();
```

### 6. 下载文件

JS SDK 提供两种下载方式：

**方式一：浏览器 URL 下载（推荐）**

通过 `<a>` 标签触发浏览器原生下载，不需要将文件内容加载到内存中，适合任意大小的文件：

```typescript
await smh.downloadByUrl({
    filePath: 'docs/file.pdf',
    fileName: 'my-file.pdf',  // 可选，自定义保存文件名
});
```

**方式二：流式下载**

适用于需要在浏览器中处理文件内容的场景：

```typescript
const downloader = smh.createDownloadTask({
    filePath: 'docs/file.pdf',
});

downloader.on('progress', (progress) => {
    console.log(`下载进度: ${progress.progress}%`);
});

// 开始下载并获取 Blob 对象
const blob = await downloader.startAndGetBlob();

// 可以用 Blob 创建预览链接
const url = URL.createObjectURL(blob);
```

## 主要功能

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
- 查询目录统计数据（子目录数、文件数、总大小，支持普通/回收站/历史版本）

### 文件管理

- **上传文件**
  - 简单上传（小文件）
  - 表单上传
  - 分片上传（大文件）
  - 断点续传
  - 秒传检测
- **下载文件**
  - 浏览器 URL 下载（推荐）
  - 流式下载（返回 Blob）
  - 获取文件信息
  - 获取文件预览
  - 获取文件封面
- **文件操作**
  - 删除文件（支持永久删除）
  - 移动/重命名文件
  - 复制文件
  - 创建符号链接
  - 文件转码
  - 检查文件状态
  - 根据 inode 获取文件信息
- **增量同步**
  - 获取增量游标（getDeltaCursor）
  - 查询增量变动日志（queryDeltaLog，基于 cursor 拉取文件变更，用于增量同步场景）

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

### 搜索功能（SearchApi）

- 搜索目录与文件（支持关键字、搜索范围 scope、文件类型、文件大小、修改时间等多种条件）
- 继续获取搜索结果（分页）
- 删除搜索任务

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

## 文档

更多详细文档请参考：

- [API 文档](https://cloud.tencent.com/document/product/1339)

## 许可证

本项目采用 ISC 许可证。

## 相关链接

- [腾讯云智能媒资托管](https://cloud.tencent.com/product/smh)
- [产品文档](https://cloud.tencent.com/document/product/1339)
- [控制台](https://console.cloud.tencent.com/smh)
