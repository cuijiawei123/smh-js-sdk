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
const searchResult = await client.search.createSearch({
  createSearchRequest: { keyword: 'test' },
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

## 错误处理与错误码

SDK 会将请求异常统一包装为 `SMHError`，并默认优先使用服务端错误码映射后的友好文案作为 `error.message`。通常业务侧**无需再手动做一次错误码转文案**；只有在需要多语言、自定义文案或更细粒度分流时，才建议自行处理。

### 1) 基础用法

```typescript
import {
  SMHClient,
  SMHError,
  ErrorCode,
  ServerErrorCode,
  getServerErrorMessage,
  setServerErrorMessages,
  resetServerErrorMessages,
  wrapErrorToSMHError,
  setErrorLocale,
} from 'smh-js-sdk'

// 设置错误消息语言（可选，默认 'zh-CN'）
// 'zh-CN' — 使用 SDK 内置中文映射
// 'en'    — 跳过中文映射，直接使用后端返回的英文 message
setErrorLocale('zh-CN')

const client = new SMHClient({
  basePath: 'https://smhxxx.api.tencentsmh.cn',
  libraryId: 'your-library-id',
  spaceId: 'your-space-id',
  accessToken: 'your-access-token',
})

try {
  await client.file.infoFile({ filePath: '/not-exist.txt', info: 1 })
} catch (error) {
  if (error instanceof SMHError) {
    // SDK 级错误码（稳定，可用于分支判断）
    console.log('code:', error.code)

    // HTTP 状态码（推荐优先读 status）
    console.log('status:', error.status)

    // 向后兼容：仍可通过 response.status 读取
    console.log('compat response.status:', error.response?.status)

    // 服务端请求 ID（用于排障）
    console.log('reqId:', error.reqId || error.response?.requestId)

    // 服务端错误码（如 LibraryNotFound / NoPermission）
    const serverCode = error.response?.serverCode as string | undefined
    console.log('serverCode:', serverCode)

    // 通常直接用 error.message 即可（SDK 已完成默认映射）
    console.log('friendlyMessage:', error.message)

    // 仅在你需要自定义兜底策略时再手动调用
    console.log('friendlyMessage(custom-fallback):', getServerErrorMessage(serverCode, '操作失败，请稍后重试'))

    if (error.code === ErrorCode.NETWORK_ERROR) {
      // 无响应的网络错误（超时/断网/DNS/连接失败等）
      console.warn('网络异常，请检查网络连接后重试')
    }

    if (error.code === ErrorCode.SERVER_ERROR) {
      // 服务端返回 5xx 错误
      console.warn('服务器异常，请稍后重试')
    }

    if (serverCode === ServerErrorCode.QuotaLimitReached) {
      console.warn('空间不足，请清理文件或扩容')
    }
  }
}

// 可按业务自定义（覆盖）服务端错误码文案
setServerErrorMessages({
  [ServerErrorCode.QuotaLimitReached]: '您的网盘空间已满，请升级套餐',
  [ServerErrorCode.NoPermission]: '无权限执行该操作，请联系管理员',
})

// 恢复为 SDK 默认文案
resetServerErrorMessages()
```

### 2) `SMHError` 关键字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | `ErrorCode` | SDK 统一错误码 |
| `message` | string | 错误消息（优先使用服务端友好文案） |
| `status` | number \| undefined | HTTP 状态码 |
| `reqId` | string \| undefined | 服务端请求 ID |
| `response` | object | 额外上下文（`api`、`serverCode`、`serverMessage`、`responseData` 等） |
| `response.status` | number \| undefined | 兼容旧版本读取方式 |
| `response.requestId` | string \| undefined | 兼容旧版本读取方式 |

### 3) SDK 错误码（`ErrorCode`）

| 错误码 | 含义 |
|------|------|
| `FileNotFound` | 文件不存在 |
| `FileModified` | 文件已被修改 |
| `FileSizeMismatch` | 文件大小不匹配 |
| `FileCrc64Mismatch` | CRC64 校验不一致 |
| `FileTooLarge` | 文件过大 |
| `InvalidFile` | 非法文件对象 |
| `UploadFailed` | 上传失败 |
| `UploadCanceled` | 上传已取消 |
| `UploadPaused` | 上传已暂停 |
| `PartUploadFailed` | 分片上传失败 |
| `RenewUploadFailed` | 上传续期失败 |
| `DownloadFailed` | 下载失败 |
| `DownloadCanceled` | 下载已取消 |
| `DownloadPaused` | 下载已暂停 |
| `InvalidParameter` | 参数非法 |
| `NetworkError` | 网络错误（无响应的网络异常：超时、断网、DNS 等） |
| `ServerError` | 服务端错误（HTTP 5xx） |
| `RequestTimeout` | 请求超时 |
| `OperationFailed` | 通用操作失败 |

### 4) 服务端错误码完整清单（`ServerErrorCode`）

> 以下清单与 SDK 源码 `utils/ErrorHandler.ts` 中的 `ServerErrorCode` 与 `serverErrorMessages` 一一对应（按 HTTP 状态分组）。

#### 400 Bad Request

| 服务端错误码 | 默认文案 |
|------|------|
| `BadRequest` | 请求无效，请检查后重试 |
| `EmptyLibraryIdOrSecret` | 媒体库配置信息缺失 |
| `EmptyLibrarySecret` | 媒体库密钥不能为空 |
| `EmptyLibraryId` | 媒体库 ID 不能为空 |
| `EmptySpaceId` | 空间 ID 不能为空 |
| `EmptyFileName` | 文件名不能为空 |
| `EmptyCosUploadId` | 上传标识缺失，请重新上传 |
| `EmptyAccessToken` | 访问令牌不能为空，请先登录 |
| `NotMultiSpaceLibrary` | 当前媒体库不支持多空间操作 |
| `MultipartUploadIncomplete` | 分片上传尚未完成，无法确认 |
| `UploadIncomplete` | 文件上传尚未完成，无法确认 |
| `DirectoryNameLengthExceed` | 文件夹名称过长，请缩短后重试 |
| `DirectoryNotAllowed` | 当前媒体库不允许创建文件夹 |
| `RootDirectoryNotAllowed` | 不允许对根目录执行此操作 |
| `DirectoryLevelExceed` | 当前媒体库只允许创建一级文件夹 |
| `FileNameLengthExceed` | 文件名过长，请缩短后重试 |
| `ExtnameNotAllowed` | 当前媒体库不允许此文件类型 |
| `UploadToRootDirectoryNotAllowed` | 不允许将文件上传到根目录 |
| `SourceDirectoryIsParentOfDestination` | 不能将文件夹移动到其子文件夹中 |
| `InvalidSourceDirectory` | 源文件夹无效 |
| `InvalidSourceFile` | 源文件无效 |
| `InvalidSpaceOrDirectoryPath` | 空间或目录路径不存在 |
| `InvalidConflictResolutionStrategy` | 冲突处理策略无效 |
| `ParamInvalid` | 请求参数无效，请检查后重试 |
| `SpaceIdInvalid` | 空间 ID 格式无效 |
| `IllegalFileName` | 文件名包含非法字符（\ / : * ? " < > |） |
| `FileTypeNotMatched` | 目标文件类型与源文件不匹配 |
| `BadCrc64` | 文件校验失败，数据可能已损坏，请重新上传 |
| `QuotaLimitReached` | 存储空间不足，请清理文件或扩容 |
| `FileUncompressNotAllowed` | 仅支持解压压缩包文件 |
| `SearchTooComplex` | 搜索条件过于复杂，请简化后重试 |
| `SearchNotEnabled` | 搜索功能未启用 |
| `RecycleBinNotEnabled` | 回收站功能未启用 |
| `QuotaSpacesInvalid` | 配额关联的空间无效 |
| `SearchIdInvalid` | 搜索标识无效 |
| `InvalidDestinationPath` | 目标路径无效 |
| `MultipartUploadPartTooSmall` | 分片大小过小，无法完成上传 |
| `IncompleteBody` | 请求数据不完整，请重试 |
| `TooManyItems` | 批量操作数量超过上限（最多 1000 项） |
| `NoItemsProvided` | 批量操作至少需要一项内容 |
| `InvalidTimeFormat` | 时间格式不正确 |
| `OverwriteFileNotAllowed` | 开启历史版本后不允许覆盖文件 |
| `InvalidFileHistoryCount` | 文件历史版本数量参数无效 |
| `InvalidFileHistoryExpireDay` | 文件历史版本过期天数参数无效 |
| `InvalidFileHistoryMergeInterval` | 版本合并间隔参数无效（5～600 秒） |
| `SymlinkDepthLimitExceeded` | 快捷方式嵌套层级超出限制 |
| `SymlinkToDirectoryNotAllowed` | 快捷方式不能指向文件夹 |
| `SymlinkOverwriteConflict` | 快捷方式和普通文件不能互相覆盖 |
| `UnsupportedSourceFormat` | 不支持的源文件格式，请使用 .txt、.doc 或 .docx 文件 |
| `UnsupportedTargetFormat` | 目标文件格式必须为 PDF |
| `FunctionNotEnabled` | 该功能未启用 |
| `UnsupportedFileType` | 文件夹或快捷方式不支持历史版本 |
| `QuotaCapacityLessThanSize` | 配额容量不能小于当前已使用空间 |
| `QuotaCapacityRequired` | 需要指定配额容量 |
| `InvalidDirectoryStatsType` | 目录统计类型无效 |
| `ResourceMigrationNotEnabled` | 资源迁移功能未启用 |
| `ResourceNotSupported` | 不支持的资源类型 |
| `ResolutionUpScalingNotAllowed` | 目标分辨率不能高于原视频分辨率 |
| `M3u8OnlyMediaPlaylistAllowed` | 仅支持 M3U8 媒体播放列表 |
| `M3u8HttpKeyNotAllowed` | M3U8 不允许使用 HTTP 密钥 |
| `M3u8HttpSegmentNotAllowed` | M3U8 不允许使用 HTTP 分段 |
| `M3u8PlaylistInvalid` | M3U8 播放列表无效 |
| `M3u8SegmentsInvalid` | M3U8 分段无效 |
| `M3u8InfoMapUnknown` | M3U8 信息映射未知 |
| `M3u8InfoMapFieldUnknown` | M3U8 信息映射字段未知 |
| `OnlyVideoCanBeTranscoded` | 仅视频文件支持转码 |
| `CaptchaInvalid` | 验证码无效，请重新输入 |
| `WatermarkNotEnabled` | 水印功能未启用 |
| `GraphicCaptchaFailed` | 图形验证码验证失败 |
| `CloseOldList` | 旧版接口已关闭，请使用新版接口 |

#### 403 Forbidden

| 服务端错误码 | 默认文案 |
|------|------|
| `NoPermission` | 没有操作权限 |
| `AccessTokenNotMatchLibrary` | 访问令牌与媒体库不匹配 |
| `AccessTokenNotMatchSpace` | 访问令牌与空间不匹配 |
| `AccessTokenVersionNotMatch` | 访问令牌版本不匹配 |
| `InvalidAccessToken` | 访问令牌无效或已过期，请重新登录 |
| `ReadForbidden` | 没有读取权限 |
| `WriteForbidden` | 没有写入权限 |
| `LibraryServiceExpired` | 媒体库服务已过期 |
| `LibraryInitializing` | 媒体库正在初始化，请稍后重试 |
| `OperationOnRawM3u8IsForbidden` | 不允许操作原始 M3U8 文件 |
| `SpaceBanned` | 空间已被禁用 |
| `ShareDisabled` | 分享功能已关闭 |
| `ShareExpired` | 分享链接已过期 |
| `ShareAuditing` | 分享链接正在审核中 |
| `ShareTokenInvalid` | 分享令牌无效 |
| `ExtractionCodeInvalid` | 提取码错误 |
| `LoginRequired` | 请先登录后访问 |
| `ShareAccessDenied` | 您无权访问此分享 |
| `AnonymousNotAllowed` | 不允许匿名用户访问 |
| `CannotPreview` | 该文件不支持预览 |
| `CannotDownload` | 该文件不允许下载 |
| `CannotSaveToNetDisk` | 不允许保存到网盘 |
| `CannotModify` | 该文件不允许修改 |
| `ShareServiceDisabled` | 分享服务已关闭 |

#### 404 Not Found

| 服务端错误码 | 默认文案 |
|------|------|
| `ConfirmKeyNotFound` | 上传确认信息未找到，请重新上传 |
| `RouteNotFound` | 请求的接口不存在 |
| `LibraryNotFound` | 媒体库不存在 |
| `SpaceNotFound` | 空间不存在 |
| `DirectoryNotFound` | 文件夹不存在 |
| `SourceDirectoryNotFound` | 源文件夹不存在 |
| `SourceFileNotFound` | 源文件不存在 |
| `UploadNotFound` | 上传任务不存在或已过期 |
| `FileNotFound` | 文件不存在 |
| `PathNotFound` | 路径不存在 |
| `MarkerNotFound` | 分页标记未找到 |
| `NoQuota` | 该空间未设置配额 |
| `QuotaNotFound` | 配额不存在 |
| `WrongLibraryIdOrSecret` | 媒体库 ID 或密钥错误 |
| `FavoriteIdNotFound` | 收藏记录不存在 |
| `FileRemovedByQuota` | 文件因超出配额已被删除 |
| `CosObjectNonexistent` | 文件存储对象不存在 |
| `RootLinkFileNotFound` | 快捷方式指向的文件不存在 |
| `TrafficStatsNotFound` | 流量统计信息不存在 |
| `M3u8Converting` | M3U8 正在转码中，请稍后重试 |
| `ShareNotFound` | 分享不存在 |
| `FileNotInShare` | 文件不在分享范围内 |
| `ShareFileEmpty` | 分享中没有文件 |

#### 408 Request Timeout

| 服务端错误码 | 默认文案 |
|------|------|
| `ReadRequestTimeout` | 请求超时，请重试 |

#### 409 Conflict

| 服务端错误码 | 默认文案 |
|------|------|
| `DuplicateQuota` | 该空间已存在配额 |
| `UploadComplete` | 上传已完成，无法重复操作 |
| `SameNameDirectoryOrFileExists` | 已存在同名文件或文件夹 |
| `DuplicateFavoriteRecord` | 该文件已收藏 |
| `SpaceNotEmpty` | 空间非空，无法删除 |
| `PathConflict` | 操作冲突，请避免同时操作同一文件 |
| `RenameTooManyTimes` | 重命名次数过多，请稍后重试 |
| `CircleSymlink` | 检测到快捷方式循环引用 |
| `ShareHasBeenUpdated` | 分享已被更新，请刷新后重试 |

#### 413 / 414 / 429 / 431

| 服务端错误码 | 默认文案 |
|------|------|
| `RequestEntityTooLarge` | 请求内容过大 |
| `URITooLong` | 请求地址过长 |
| `RateLimitExceeded` | 操作过于频繁，请稍后重试 |
| `HeaderFieldsTooLarge` | 请求头信息过大 |

#### 451

| 服务端错误码 | 默认文案 |
|------|------|
| `SensitiveContentRecognized` | 内容包含敏感信息，操作被拒绝 |

#### 499

| 服务端错误码 | 默认文案 |
|------|------|
| `ClientDisconnected` | 连接已断开 |

#### 500 / 503

| 服务端错误码 | 默认文案 |
|------|------|
| `ServerOverloaded` | 服务器繁忙，请稍后重试 |
| `InternalServerError` | 服务器内部错误，请稍后重试 |
| `RequestTimeout` | 服务器处理超时，请稍后重试 |

### 5) 错误处理建议

- 优先按 `error.code` 做业务分支，保证逻辑稳定。
- `NetworkError` 表示客户端网络不可达（断网/超时/DNS 等），`ServerError` 表示服务端返回 5xx，两者可分别制定重试策略。
- 需要展示给用户时，**优先直接使用 `error.message`**（默认已映射）；仅在需要覆盖文案时再调用 `getServerErrorMessage(serverCode)`。
- 需要排障时，记录 `status`、`reqId`、`response.serverCode`、`response.responseData`。
- 与旧代码兼容时，可继续使用 `error.response?.status`。

### 6) 工具方法

| 方法 | 说明 |
|------|------|
| `setErrorLocale(locale)` | 设置错误消息语言：`'zh-CN'`（默认，中文映射）或 `'en'`（使用后端英文 message） |
| `getErrorLocale()` | 获取当前错误消息语言 |
| `getServerErrorMessage(serverCode, fallback?)` | 根据服务端错误码获取友好提示（受 locale 控制） |
| `setServerErrorMessages(messages)` | 批量自定义/覆盖服务端错误码文案 |
| `resetServerErrorMessages()` | 恢复为 SDK 默认的错误码文案映射 |
| `wrapErrorToSMHError(error, defaultCode, fallbackMsg, extra?)` | 将任意错误统一包装为 `SMHError`（自动提取 AxiosError 详情） |
| `newError(code, message, cause?, response?, options?)` | 手动创建 `SMHError` 实例 |

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

### 搜索功能（SearchApi）

- 搜索目录与文件
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
- 空间管理、Token 管理

### 运行 Demo

```bash
# 1. 克隆项目
git clone https://git.woa.com/smh/smh-js-sdk-demo.git
cd smh-js-sdk-demo

# 2. 配置环境变量
cp .env.example .env
```

编辑 `.env` 文件，填入你的 SMH 配置：

```env
VITE_SMH_BASE_PATH=https://api.tencentsmh.cn
VITE_SMH_LIBRARY_ID=your_library_id
VITE_SMH_SPACE_ID=your_space_id
VITE_SMH_ACCESS_TOKEN=your_access_token
VITE_SMH_USER_ID=your_user_id
```

```bash
# 3. 安装依赖并启动
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。页面顶部的配置区支持在线修改参数（会覆盖 `.env` 中的默认值）。

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