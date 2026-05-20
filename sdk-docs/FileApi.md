# 文件管理

本文介绍文件管理功能的示例代码和描述。包括文件信息获取、预览、复制、移动、转码、删除、查询文件删除原因等操作。

## 注意事项

- 如果媒体库启用回收站功能，删除文件时会移入回收站而非永久删除。
- 下载链接带签名，有效时长约 2 小时，需在签名有效期内发起下载。
- 符号链接所指向的文件不会因为重命名或移动而丢失指向。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 获取文件信息

### 功能说明

infoFile 实现获取文件信息，用于获取文件的详细信息和下载链接。支持获取历史版本文件信息。

### 使用示例

```typescript
// 获取文件详细信息
const res = await smh.file.infoFile({
    spaceId: 'your-space-id',
    filePath: 'test.xlsx',
    info: 1,
    userId: 'xxx',
    contentDisposition: 'inline',
    historyId: '123',
    purpose: 'preview',
    preCheck: 1
});

if (res.status === 200) {
    console.log('文件信息获取成功', res.data);
}

// 获取短链形式的下载链接，并指定有效期
const res2 = await smh.file.infoFile({
    spaceId: 'your-space-id',
    filePath: 'test.xlsx',
    info: 1,
    withShortLink: 1,
    period: 3600,
    withFavoriteStatus: 1,
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| info | 获取文件信息标识，固定为 1 | Number | 是 |
| historyId | 历史版本 ID，用于获取不同版本的文件内容，不传默认为最新版 | String | 否 |
| contentDisposition | 用于设置 Content-Disposition 响应头，支持 inline 或 attachment，默认为 inline | String | 否 |
| purpose | 用途，可设置为 download 或 preview，用于决定是否将该文件加入最近使用文件列表中 | String | 否 |
| userId | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份 | String | 否 |
| trafficLimit | 单链接下载限速，范围 100KB/s-100MB/s，单位 B | Number | 否 |
| preCheck | 是否只用于校验文件是否可预览和下载，设置该参数后返回结果中不包含 cosUrl | Number | 否 |
| contentCas | 文件内容的 Cas 标识，可选参数 | String | 否 |
| withContentCas | 0 或 1，是否返回文件内容的 Cas 标识，可选，默认不返回 | Number | 否 |
| internalDomain | 0 或 1，是否使用内网域名生成文件访问/上传链接，可选参数，默认不使用；设置为 1 时返回的 URL 将使用内网域名，适用于同地域内网访问场景 | Number | 否 |
| withShortLink | 0 或 1，可选参数，默认为 0。设置为 1 时，返回的 cosUrl（及 availableCosUrls 中的地址）将被替换为短链形式 | Number | 否 |
| period | 整数（单位：秒），可选参数。用于指定返回的下载/预览链接（或短链）的有效期，取值范围 [60, 7200]，默认为 2 小时（7200 秒） | Number | 否 |
| withFavoriteStatus | 0 或 1，可选参数，默认为 0。设置为 1 时，返回结果中将包含当前用户对该文件的收藏状态 | Number | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回文件详细信息。

**响应示例**

```json
{
  "cosUrl": "xxx",
  "type": "video",
  "creationTime": "2021-02-01T08:21:47.000Z",
  "modificationTime": "2021-02-01T08:21:47.000Z",
  "contentType": "video/mp4",
  "size": "xxx",
  "eTag": "\"xxx\"",
  "crc64": "xxx",
  "fileType": "powerpoint",
  "previewByDoc": true,
  "previewByCI": false,
  "previewAsIcon": true,
  "metaData": {
    "x-smh-meta-foo": "bar"
  },
  "labels": ["动物", "大象", "亚洲象"],
  "category": "video",
  "localCreationTime": "2022-07-26T02:58:09.000Z",
  "localModificationTime": "2022-07-26T02:58:09.000Z",
  "versionId": 1
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| cosUrl | 带签名的下载链接，签名有效时长约 2 小时 | String |
| type | 文件类型 | String |
| creationTime | 文件首次完成上传的时间 | String |
| modificationTime | 文件最近一次被覆盖的时间 | String |
| contentType | 媒体类型 | String |
| size | 文件大小，为了避免数字精度问题，这里为字符串格式 | String |
| eTag | 文件 ETag | String |
| crc64 | 文件的 CRC64-ECMA182 校验值 | String |
| fileType | 文件类型：excel、powerpoint 等 | String |
| previewByDoc | 是否可通过 wps 预览 | Boolean |
| previewByCI | 是否可通过万象预览 | Boolean |
| previewAsIcon | 是否可用预览图当做 icon | Boolean |
| metaData | 元数据，如果没有元数据则不存在该字段 | Object |
| labels | 简易文件标签列表 | Array |
| category | 文件自定义的分类 | String |
| localCreationTime | 文件对应的本地创建时间 | String |
| localModificationTime | 文件对应的本地修改时间 | String |
| versionId | 文件版本号 | Number |

---

## 获取照片/视频封面缩略图

### 功能说明

getCover 实现获取照片/视频封面缩略图，用于获取文件的封面图片或视频帧。支持指定尺寸和缩放比例。

### 使用示例

```typescript
// 获取封面预览
const res = await smh.file.getCover({
    spaceId: 'your-space-id',
    filePath: 'video.mp4',
    preview: 1,
    userId: 'xxx',
    size: 256,
    scale: 12,
    widthSize: 256,
    heightSize: 256,
    frameNumber: 1
});

if (res.status === 302) {
    console.log('封面获取成功，重定向到封面 URL');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| preview | 预览标识，固定为 1 | Number | 是 |
| userId | 用户身份识别 | String | 否 |
| size | 缩略图尺寸，单位像素 | Number | 否 |
| scale | 缩放比例 | Number | 否 |
| widthSize | 宽度尺寸，单位像素 | Number | 否 |
| heightSize | 高度尺寸，单位像素 | Number | 否 |
| frameNumber | 视频帧号 | Number | 否 |

### 返回值说明

**HTTP 状态码：302**

重定向到封面图片 URL。

---

## 获取文档预览

### 功能说明

previewFile 实现获取文档预览，用于获取 HTML 格式或图片格式的文档预览。支持 PPT、Word、Excel 等文档类型。

### 使用示例

```typescript
// 获取 HTML 格式预览
const res = await smh.file.previewFile({
    spaceId: 'your-space-id',
    filePath: 'foo/bar.pptx',
    preview: 1,
    historyId: '1',
    type: 'html',
    userId: 'xxx'
});

if (res.status === 302) {
    console.log('预览获取成功，重定向到预览 URL');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| preview | 预览标识，固定为 1 | Number | 是 |
| historyId | 历史版本 ID | String | 否 |
| type | 预览类型，html 或 pic | String | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：302**

重定向到预览 URL。

---

## 下载文件

### 功能说明

downloadFile 实现下载文件，用于获取文件的下载链接。支持设置下载限速和响应头。

### 使用示例

```typescript
// 下载
const res2 = await smh.file.downloadFile({
    spaceId: 'your-space-id',
    filePath: 'test.xlsx',
    contentDisposition: 'inline',
    purpose: 'download',
    userId: 'xxx',
    trafficLimit: 102400
});

if (res2.status === 302) {
    console.log('下载链接获取成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| contentDisposition | 用于设置 Content-Disposition 响应头，支持 inline 或 attachment | String | 否 |
| purpose | 用途，可设置为 download 或 preview | String | 否 |
| userId | 用户身份识别 | String | 否 |
| trafficLimit | 单链接下载限速，范围 100KB/s-100MB/s，单位 B | Number | 否 |

### 返回值说明

**HTTP 状态码：302**

重定向到文件下载 URL。

**响应头说明**

| 响应头 | 说明 | 类型 |
|--------|------|------|
| location | 重定向的下载 URL | String |
| x-smh-type | 文件类型 | String |
| x-smh-creation-time | 文件创建时间 | String |
| x-smh-modification-time | 文件修改时间 | String |
| x-smh-content-type | 媒体类型 | String |
| x-smh-size | 文件大小 | String |
| x-smh-etag | 文件 ETag | String |
| x-smh-crc64 | 文件 CRC64 校验值 | String |

---

## 开始表单上传文件

### 功能说明

formUploadFile 实现开始表单上传文件，用于通过 multipart/form-data 格式上传文件。支持秒传功能。

### 使用示例

```typescript
// 开始表单上传
const res = await smh.file.formUploadFile({
    spaceId: 'your-space-id',
    filePath: '/form-upload-test.xlsx',
    conflictResolutionStrategy: 'rename',
    filesize: 2081112,
    userId: 'xxx',
    trafficLimit: 102400,
    preferSameOrigin: true,
    formUploadFileRequest: {
        fullHash: '9fee55123adad49e5090236eead6a8a9edc9caaa0f97b9e38c3713c1b97b9d29',
        beginningHash: '9faskdfhwek2h3r4kjdsjkahfsdkfhjaksdldc9caaa0f97b9e38c3713c1b97b9d29',
        size: '2081112',
        labels: ['大象', '动物', '亚洲象'],
        category: 'video',
        localCreationTime: new Date().toISOString(),
        localModificationTime: new Date().toISOString()
    }
});

if (res.status === 201) {
    console.log('上传任务创建成功', res.data);
} else if (res.status === 200) {
    console.log('秒传成功', res.data);
} else if (res.status === 202) {
    console.log('beginningHash 匹配，秒传成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式，ask: 冲突时返回错误，rename: 自动重命名，overwrite: 覆盖已有文件，默认为 rename | String | 否 |
| filesize | 上传文件大小，单位为字节，用于判断剩余空间是否足够 | Number | 否 |
| userId | 用户身份识别 | String | 否 |
| trafficLimit | 单链接下载限速，范围 100KB/s-100MB/s，单位 B | Number | 否 |
| preferSameOrigin | 是否倾向于保持相同域名 | Boolean | 否 |
| formUploadFileRequest | 表单上传请求对象 | Object | 否 |

**formUploadFileRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| fullHash | SMH 定义的文件的 fullHash 值，用于秒传 | String | 否 |
| beginningHash | 文件前 1M 的 fullHash 值，用于秒传 | String | 否 |
| size | 文件大小，用于秒传，size >= 1M 的文件才能实现秒传 | String | 否 |
| labels | 文件标签列表 | Array | 否 |
| category | 文件自定义的分类 | String | 否 |
| localCreationTime | 文件对应的本地创建时间 | String | 否 |
| localModificationTime | 文件对应的本地修改时间 | String | 否 |

### 返回值说明

**HTTP 状态码：201**

上传任务创建成功（不符合秒传条件时返回）。

**响应示例**

```json
{
  "domain": "examplebucket-1250000000.cos.ap-beijing.myqcloud.com",
  "path": "/",
  "form": {
    "key": "xxx",
    "acl": "default",
    "Content-Type": "image/jpeg",
    "x-cos-security-token": "xxx",
    "policy": "xxx",
    "q-sign-algorithm": "sha1",
    "q-ak": "xxx",
    "q-key-time": "xxx",
    "q-signature": "xxx"
  },
  "confirmKey": "xxx",
  "expiration": "2021-07-24T10:34:32.000Z",
  "availableDomainNum": 1
}
```

**HTTP 状态码：202**

beginningHash 匹配秒传文件（响应体为空）。

**HTTP 状态码：200**

fullHash 匹配秒传文件（完全符合秒传条件时返回）。

---

## 开始简单上传文件

### 功能说明

simpleUploadFile 实现开始简单上传文件，用于通过简单上传方式上传文件。适用于小文件上传。

### 使用示例

```typescript
const res = await smh.file.simpleUploadFile({
    spaceId: 'your-space-id',
    filePath: '/simple.txt',
    conflictResolutionStrategy: 'rename',
    filesize: 2081112,
    userId: 'xxx',
    trafficLimit: 102400,
    preferSameOrigin: true,
    simpleUploadFileRequest: {
        size: '2081112',
        labels: ['大象', '动物', '亚洲象'],
        category: 'video',
        localCreationTime: new Date().toISOString(),
        localModificationTime: new Date().toISOString()
    }
});

if (res.status === 201) {
    console.log('简单上传任务创建成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式 | String | 否 |
| filesize | 上传文件大小，单位为字节 | Number | 否 |
| userId | 用户身份识别 | String | 否 |
| trafficLimit | 单链接下载限速 | Number | 否 |
| preferSameOrigin | 是否倾向于保持相同域名 | Boolean | 否 |
| simpleUploadFileRequest | 简单上传请求对象 | Object | 否 |

**simpleUploadFileRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| size | 文件大小 | String | 否 |
| labels | 文件标签列表 | Array | 否 |
| category | 文件自定义的分类 | String | 否 |
| localCreationTime | 文件对应的本地创建时间 | String | 否 |
| localModificationTime | 文件对应的本地修改时间 | String | 否 |

### 返回值说明

**HTTP 状态码：201/200/202**

上传任务创建成功或秒传成功。

---

## 开始分块上传文件

### 功能说明

multipartUploadFile 实现开始分块上传文件，用于通过分块上传方式上传大文件。支持秒传功能。

### 使用示例

```typescript
const res = await smh.file.multipartUploadFile({
    spaceId: 'your-space-id',
    filePath: '/multipart-upload-test.xlsx',
    multipart: 1,
    conflictResolutionStrategy: 'rename',
    filesize: 2081112,
    userId: 'xxx',
    trafficLimit: 102400,
    preferSameOrigin: true,
    multipartUploadFileRequest: {
        fullHash: '9fee55123adad49e5090236eead6a8a9edc9caaa0f97b9e38c3713c1b97b9d29',
        beginningHash: '9faskdfhwek2h3r4kjdsjkahfsdkfhjaksdldc9caaa0f97b9e38c3713c1b97b9d29',
        size: '2081112',
        labels: ['大象', '动物', '亚洲象'],
        category: 'video',
        localCreationTime: new Date().toISOString(),
        localModificationTime: new Date().toISOString()
    }
});

if (res.status === 201) {
    console.log('分块上传任务创建成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| multipart | 分块上传标识，固定为 1 | Number | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式 | String | 否 |
| filesize | 上传文件大小，单位为字节 | Number | 否 |
| userId | 用户身份识别 | String | 否 |
| trafficLimit | 单链接下载限速 | Number | 否 |
| preferSameOrigin | 是否倾向于保持相同域名 | Boolean | 否 |
| multipartUploadFileRequest | 分块上传请求对象 | Object | 否 |

**multipartUploadFileRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| fullHash | SMH 定义的文件的 fullHash 值，用于秒传 | String | 否 |
| beginningHash | 文件前 1M 的 fullHash 值，用于秒传 | String | 否 |
| size | 文件大小，用于秒传 | String | 否 |
| labels | 文件标签列表 | Array | 否 |
| category | 文件自定义的分类 | String | 否 |
| localCreationTime | 文件对应的本地创建时间 | String | 否 |
| localModificationTime | 文件对应的本地修改时间 | String | 否 |

### 返回值说明

**HTTP 状态码：201/200/202**

上传任务创建成功或秒传成功。

---

## 分块上传任务续期

### 功能说明

renewMultipartUpload 实现分块上传任务续期，用于延长分块上传任务的有效期。

### 使用示例

```typescript
const res = await smh.file.renewMultipartUpload({
    spaceId: 'your-space-id',
    confirmKey: 'xxx',
    renew: 1,
    userId: 'xxx',
    trafficLimit: 102400
});

if (res.status === 200) {
    console.log('任务续期成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| confirmKey | 确认参数 | String | 是 |
| renew | 续期标识，固定为 1 | Number | 是 |
| userId | 用户身份识别 | String | 否 |
| trafficLimit | 单链接下载限速 | Number | 否 |

### 返回值说明

**HTTP 状态码：200**

续期成功，返回新的上传信息。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| domain | 上传域名 | String |
| path | 上传路径 | String |
| uploadId | 上传 ID | String |
| headers | 上传所需的请求头 | Object |
| confirmKey | 确认参数 | String |
| expiration | 新的过期时间 | String |

---

## 完成上传文件

### 功能说明

completeFileUpload 实现完成上传文件，用于确认文件上传完成并获取最终的文件信息。

### 使用示例

```typescript
const res = await smh.file.completeFileUpload({
    spaceId: 'your-space-id',
    confirmKey: 'xxx',
    confirm: 1,
    conflictResolutionStrategy: 'rename',
    userId: 'xxx',
    withInode: 1,
    completeFileUploadRequest: {
        crc64: 'xxx',
        labels: ['大象', '动物', '亚洲象'],
        category: 'video',
        localCreationTime: '2022-07-26T02:58:09Z',
        localModificationTime: '2022-07-26T02:58:09Z'
    }
});

if (res.status === 200) {
    console.log('上传完成', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| confirmKey | 确认参数 | String | 是 |
| confirm | 确认标识，固定为 1 | Number | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式 | String | 否 |
| userId | 用户身份识别 | String | 否 |
| withInode | 是否返回 inode 信息 | Number | 否 |
| completeFileUploadRequest | 完成上传请求对象 | Object | 否 |

**completeFileUploadRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| crc64 | 文件的 CRC64 校验值 | String | 否 |
| labels | 文件标签列表 | Array | 否 |
| category | 文件自定义的分类 | String | 否 |
| localCreationTime | 文件对应的本地创建时间 | String | 否 |
| localModificationTime | 文件对应的本地修改时间 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

上传完成，返回文件信息。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| path | 最终的文件路径 | Array |
| name | 最终文件名 | String |
| type | 文件类型 | String |
| inode | 文件 inode（当 withInode=1 时返回） | String |
| contentType | 媒体类型 | String |
| size | 文件大小 | String |
| eTag | 文件 ETag | String |
| crc64 | 文件 CRC64 校验值 | String |
| isOverwritten | 文件上传时是否发生文件覆盖 | Boolean |
| previewByDoc | 是否可通过 wps 预览 | Boolean |
| previewByCI | 是否可通过万象预览 | Boolean |
| previewAsIcon | 是否可用预览图作为 icon | Boolean |
| fileType | 文件类型：excel、powerpoint 等 | String |
| virusAuditStatus | 病毒查毒状态，0-6 | Number |

---

## 创建符号链接

### 功能说明

createSymlink 实现创建符号链接，用于创建指向其他文件的符号链接。符号链接所指向的文件不会因为重命名或移动而丢失指向。

### 使用示例

```typescript
const res = await smh.file.createSymlink({
    spaceId: 'your-space-id',
    filePath: 'test.xlsx',
    conflictResolutionStrategy: 'rename',
    userId: 'xxx',
    createSymlinkRequest: {
        linkTo: 'dest/test.xlsx'
    }
});

if (res.status === 200) {
    console.log('符号链接创建成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 符号链接路径 | String | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式 | String | 否 |
| userId | 用户身份识别 | String | 否 |
| createSymlinkRequest | 创建符号链接请求对象 | Object | 是 |

**createSymlinkRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| linkTo | 符号链接指向的源文件绝对路径 | String | 是 |

### 返回值说明

**HTTP 状态码：200**

创建成功，返回符号链接路径。

**响应示例**

```json
{
  "path": ["foo", "bar2", "file (1).docx"]
}
```

---

## 文档转码

### 功能说明

convertFile 实现文档转码，用于将文档转换为其他格式。支持异步转码任务。

### 使用示例

```typescript
const res = await smh.file.convertFile({
    spaceId: 'your-space-id',
    filePath: '/test.pdf',
    convert: 1,
    conflictResolutionStrategy: 'rename',
    userId: 'xxx',
    convertFileRequest: {
        convertFrom: 'dest/test.docx'
    }
});

if (res.status === 202) {
    console.log('转码任务创建成功', res.data);
} else if (res.status === 200) {
    console.log('转码任务执行成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目标文件路径 | String | 是 |
| convert | 转码标识，固定为 1 | Number | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式 | String | 否 |
| userId | 用户身份识别 | String | 否 |
| convertFileRequest | 转码请求对象 | Object | 是 |

**convertFileRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| convertFrom | 源文件路径 | String | 是 |

### 返回值说明

**HTTP 状态码：202**

任务创建成功。

**HTTP 状态码：200**

查询到任务执行成功。

---

## 检查文件状态

### 功能说明

checkFileStatus 实现检查文件状态，用于检查文件是否存在。

### 使用示例

```typescript
const res = await smh.file.checkFileStatus({
    spaceId: 'your-space-id',
    filePath: 'test.xlsx',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('文件存在');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| historyId | 历史版本 ID | String | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

文件存在。

---

## 复制文件

### 功能说明

copyFile 实现复制文件，用于将文件复制到目标路径。

### 使用示例

```typescript
const res = await smh.file.copyFile({
    spaceId: 'your-space-id',
    filePath: 'test.xlsx',
    conflictResolutionStrategy: 'rename',
    userId: 'xxx',
    copyFileRequest: {
        copyFrom: '/dest/test.xlsx'
    }
});

if (res.status === 200) {
    console.log('文件复制成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目标文件路径 | String | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式 | String | 否 |
| userId | 用户身份识别 | String | 否 |
| copyFileRequest | 复制文件请求对象 | Object | 是 |

**copyFileRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| copyFrom | 源文件路径 | String | 是 |

### 返回值说明

**HTTP 状态码：200**

复制成功，返回目标文件信息。

---

## 重命名或移动文件

### 功能说明

moveFile 实现重命名或移动文件，用于将文件移动到目标路径或重命名文件。

### 使用示例

```typescript
const res = await smh.file.moveFile({
    spaceId: 'your-space-id',
    filePath: 'test.xlsx',
    conflictResolutionStrategy: 'rename',
    userId: 'xxx',
    moveFileRequest: {
        from: '/dest/test.xlsx'
    }
});

if (res.status === 200) {
    console.log('文件移动成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目标文件路径 | String | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式 | String | 否 |
| userId | 用户身份识别 | String | 否 |
| moveFileRequest | 移动文件请求对象 | Object | 是 |

**moveFileRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| from | 源文件路径 | String | 是 |

### 返回值说明

**HTTP 状态码：200**

移动成功，返回目标文件信息。

---

## 删除文件

### 功能说明

deleteFile 实现删除文件，用于删除指定文件。如果媒体库启用回收站功能，则文件会被移入回收站而非永久删除。

### 使用示例

```typescript
// 移入回收站
const res = await smh.file.deleteFile({
    spaceId: 'your-space-id',
    filePath: 'test (1).xlsx',
    permanent: 0,
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('文件已移入回收站', res.data);
} else if (res.status === 204) {
    console.log('文件已永久删除');
}

// 永久删除
const res2 = await smh.file.deleteFile({
    spaceId: 'your-space-id',
    filePath: 'test.xlsx',
    permanent: 1,
    userId: 'xxx'
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| permanent | 当媒体库开启回收站时，该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0 | Number | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：204**

删除成功（未开启回收站）。

**HTTP 状态码：200**

删除成功（开启回收站），返回回收站项目 ID。

**响应示例**

```json
{
  "recycledItemId": 123
}
```

---

## 获取文件上传任务状态

### 功能说明

getFileUpload 实现获取文件上传任务状态，用于查询上传任务的执行情况。

### 使用示例

```typescript
const res = await smh.file.getFileUpload({
    spaceId: 'your-space-id',
    confirmKey: '8a2465073bb1b96000064283bf85cbe2',
    upload: 1,
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('上传任务状态获取成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| upload | 上传标识，固定为 1 | Number | 是 |
| confirmKey | 确认参数 | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回上传任务状态。

---

## 中止文件上传任务

### 功能说明

abortFileUpload 实现中止文件上传任务，用于取消正在进行的上传任务。

### 使用示例

```typescript
const res = await smh.file.abortFileUpload({
    spaceId: 'your-space-id',
    confirmKey: 'ed61d863f7109b0700064283a83aeee6',
    upload: 1,
    userId: 'xxx'
});

if (res.status === 204) {
    console.log('上传任务已中止');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| confirmKey | 确认参数 | String | 是 |
| upload | 上传标识，固定为 1 | Number | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：204**

中止成功。

---

## 查询文件删除原因

### 功能说明

checkFileDeletion 实现查询文件删除原因，用于查询文件被删除的原因，可能是用户主动删除或者 quota 超限删除。要求权限：admin 或 space_admin。

### 使用示例

```typescript
const res = await smh.file.checkFileDeletion({
    spaceId: 'your-space-id',
    inode: '46bb40dd044f66340006425bd913af6f'
});

if (res.status === 200) {
    console.log('查询成功', res.data);
    // res.data.reason: 'RemovedByQuota' | 'Unknown'
    // res.data.deletedAt: 删除时间
    // res.data.quotaCleanupRecordRetentionDays: 保留天数
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| inode | 文件的 Inode | String | 是 |

### 返回值说明

**HTTP 状态码：200**

查询成功，返回文件删除原因。

**响应示例**

```json
{
  "reason": "RemovedByQuota",
  "deletedAt": "2024-01-15T08:30:00.000Z",
  "quotaCleanupRecordRetentionDays": 30
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| reason | 文件删除的原因，RemovedByQuota: quota 超限删除，Unknown: 未知原因（如用户主动删除） | String |
| deletedAt | 文件删除的时间 | String |
| quotaCleanupRecordRetentionDays | quota 超限删除流水保留天数 | Number |

---

## 根据 inode 获取文件信息

### 功能说明

getFileInfoByInode 实现根据 inode 获取文件信息，用于通过文件的 inode 查询文件详细信息。

### 使用示例

```typescript
const res = await smh.file.getFileInfoByInode({
    spaceId: 'your-space-id',
    iNode: '46bb40dd044f66340006425bd913af6f'
});

if (res.status === 200) {
    console.log('文件信息获取成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| iNode | 文件 inode | String | 是 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回文件详细信息。

---

## 获取增量游标

### 功能说明

getDeltaCursor 实现获取增量游标，用于获取当前最新的增量游标（cursor），该 cursor 标记了当前变更日志的最新位置。调用方可保存此 cursor，后续作为 [查询增量变动日志](#查询增量变动日志) 接口的起始位置，从该位置开始拉取增量变更。

增量同步典型使用流程：

1. 首次同步时，先调用本接口获取当前最新的 cursor（锚定变更日志位置）；
2. 然后调用列出目录或文件接口全量拉取空间文件列表；
3. 全量拉取完成后，使用步骤 1 获取的 cursor 调用 queryDeltaLog 接口，补齐全量拉取期间产生的变更；
4. 后续定期使用保存的 cursor 调用 queryDeltaLog 进行增量同步。

> cursor 是一个不透明的字符串标记，代表增量同步的位置，调用方应将其作为黑盒保存和传递，**无需解析其内容**。

### 使用示例

```typescript
const res = await smh.file.getDeltaCursor({
    spaceId: 'your-space-id',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('当前最新增量游标:', res.data.cursor);
    // 建议将 cursor 持久化保存，后续用于调用 queryDeltaLog 进行增量同步
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| userId | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回当前最新的增量游标。

**响应示例**

```json
{
  "cursor": "eyJ2IjoxLCJ0IjoxNzAwMDAwMDAwMDAwfQ=="
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| cursor | 当前最新的增量游标，可作为增量查询变动日志接口的起始点，调用方应将其视为不透明标记进行保存和传递 | String |

---

## 查询增量变动日志

### 功能说明

queryDeltaLog 实现查询增量变动日志，用于根据增量游标（cursor）拉取文件系统的增量变更日志列表，返回从 cursor 位置之后发生的所有文件/目录变动事件。返回的新 cursor 可用于下次请求，实现连续的增量同步。

**使用说明：**

- 首次调用时传入通过 [获取增量游标](#获取增量游标) 接口获取的 cursor，后续传入上次返回的 cursor 进行连续拉取；
- 当返回的 hasMore 为 true 时，应继续使用返回的 cursor 拉取后续数据，直到 hasMore 为 false；
- 变更日志按数据库事务提交顺序有序返回，保证事件的全局一致性顺序。注意 eventTime 在并发场景下未必严格递增；
- 变更日志记录了文件/目录的创建、修改、删除、移动、复制、放入回收站、从回收站恢复等事件；
- cursor 的最大有效期为 180 天（可通过服务端配置调整），使用过期 cursor 时服务端会返回 HTTP 400 错误，错误码为 `CursorExpired`，此时应重新获取 cursor 并进行全量同步。

### 使用示例

```typescript
// 基于 cursor 拉取增量变更
let cursor = savedCursor; // 来自上一次调用或 getDeltaCursor 的返回
do {
    const res = await smh.file.queryDeltaLog({
        spaceId: 'your-space-id',
        cursor,
        limit: 100,
        userId: 'xxx'
    });

    if (res.status === 200) {
        const { contents = [], cursor: nextCursor, hasMore } = res.data;
        contents.forEach(item => {
            console.log(item.eventType, item.name, item.inode, item.eventTime);
        });
        cursor = nextCursor as string; // 持久化保存，下一次继续从该 cursor 拉取
        if (!hasMore) break;
    } else {
        break;
    }
} while (true);
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| cursor | 增量游标，首次调用传 getDeltaCursor 返回的 cursor，后续传上次返回的 cursor | String | 是 |
| limit | 用于分页时本次拉取的项目数限制，默认 100，最大 1000 | Number | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回增量变更日志列表。

**响应示例**

```json
{
  "cursor": "eyJ2IjoxLCJ0IjoxNzAwMDAwMDAwMDAwfQ==",
  "hasMore": true,
  "contents": [
    {
      "eventType": "FILE.CREATE",
      "eventTime": "2024-07-26T02:58:09.123Z",
      "inode": "46bb40dd044f66340006425bd913af6f",
      "parentInode": "b63393076d249110000631c316d9751a",
      "name": "report.pdf",
      "type": "file",
      "size": "1048576",
      "eTag": "xxx",
      "crc64": "xxx",
      "contentType": "application/pdf",
      "category": "document",
      "fileType": "pdf",
      "creationTime": "2024-07-26T02:58:09.000Z",
      "modificationTime": "2024-07-26T02:58:09.000Z",
      "userId": "123",
      "versionId": 1,
      "location": 0,
      "removedByQuota": false,
      "extraInfo": {
        "isRapidUpload": false
      }
    }
  ]
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| cursor | 下一次请求使用的增量游标，调用方应将其视为不透明标记进行保存，用于下次增量拉取 | String |
| hasMore | 是否还有更多数据，为 true 时应继续使用返回的 cursor 拉取 | Boolean |
| contents | 增量变更日志列表 | Array |

**contents 数组元素字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| eventType | 事件类型，详见下方"事件类型枚举" | String |
| eventTime | 事件发生时间（精确到毫秒），ISO 8601 格式 | String |
| inode | 文件/目录的唯一标识 ID | String |
| parentInode | 父目录的唯一标识 ID | String |
| name | 文件名或目录名 | String |
| type | 节点类型：file-文件，dir-目录，symlink-符号链接 | String |
| size | 文件大小，字符串格式以避免精度问题（仅文件类型返回） | String |
| eTag | 文件 ETag（仅文件类型返回） | String |
| crc64 | 文件的 CRC64-ECMA182 校验值（仅文件类型返回） | String |
| contentType | 媒体类型（仅文件类型返回） | String |
| category | 文件自定义分类，如 image、video、document 等（仅文件类型返回） | String |
| fileType | 文件类型：excel、powerpoint、word、image 等（仅文件类型返回） | String |
| creationTime | 文件的创建时间或上传时间 | String |
| modificationTime | 文件最近一次被覆盖的时间，或目录内最近一次增删子目录或文件的时间 | String |
| localCreationTime | 文件对应的本地创建时间（仅文件类型返回） | String |
| localModificationTime | 文件对应的本地修改时间（仅文件类型返回） | String |
| userId | 操作者用户 ID | String |
| versionId | 版本号（仅文件类型返回） | Number |
| location | 文件位置：0-普通文件/目录，1-回收站中，2-历史版本文件，3-已标记删除的普通文件（软删除） | Number |
| removedByQuota | 是否被配额策略删除标记 | Boolean |
| linkTo | 软链接指向的目标文件 inode（仅软链接类型返回） | String |
| extraInfo | 额外信息，不同事件类型携带不同扩展字段，详见下方"extraInfo 说明" | Object / null |

**事件类型枚举**

| eventType | 说明 |
|-----------|------|
| FILE.CREATE | 文件/目录/软链接创建（包括上传完成、秒传、目录创建、软链接创建） |
| FILE.MODIFY | 文件内容修改（包括文件内容更新、覆盖上传） |
| FILE.DELETE | 文件彻底删除（非回收站删除） |
| FILE.COPY | 文件/目录复制 |
| FILE.MOVE | 文件/目录移动（含重命名） |
| FILE.TRASH | 文件/目录放入回收站 |
| FILE.RESTORE | 文件/目录从回收站恢复 |
| FILE.CREATE_OVERWRITE | 创建文件时覆盖已有文件 |
| FILE.MOVE_OVERWRITE | 移动文件时覆盖已有文件 |
| FILE.COPY_OVERWRITE | 拷贝文件时覆盖已有文件 |
| FILE.RESTORE_OVERWRITE | 从回收站恢复时覆盖已有文件 |
| TASK.FILE.DELETE | 系统任务触发的文件彻底删除 |
| TASK.FILE.TRASH | 系统任务触发的放入回收站操作 |
| TASK.FILE.RESTORE | 系统任务触发的从回收站恢复操作 |
| RECYCLE.DELETE | 从回收站彻底删除 |
| RECYCLE.MODIFY | 回收站项目信息更新 |
| HISTORY.CREATE | 历史版本创建 |
| HISTORY.DELETE | 历史版本删除 |
| HISTORY.LATEST | 设为最新版本（回滚到指定历史版本） |
| HISTORY.MODIFY | 历史版本更新 |

**extraInfo 说明**

- `FILE.CREATE`：`isRapidUpload`（布尔值，是否为秒传创建）；软链接创建时额外包含 `targetInode`（字符串，软链接指向的目标 inode）。
- `FILE.MODIFY`：`oldSize`（整数，修改前文件大小）、`newSize`（整数，修改后文件大小）、`oldEtag`（字符串，修改前文件 ETag）。
- `FILE.COPY`：`sourceInode`（字符串，复制源文件/目录的 inode）。
- `FILE.MOVE`：`fromParentInode`、`toParentInode`（字符串，移动前/后的父目录 inode）；跨空间移动时还包含 `fromLibraryId` 与 `fromSpaceId`。
- `FILE.*_OVERWRITE`：保留原事件类型的 extraInfo 字段，额外包含被覆盖文件信息 `owInode`、`owSize`、`owEtag`、`owCRC64`、`owContentType`、`owRevisionVersion`。
- `HISTORY.CREATE`：`versionId`（字符串，历史版本标识）。
- `HISTORY.LATEST`：`owInode`、`owSize`、`owEtag`、`owCRC64`、`owContentType`、`owRevisionVersion`（被覆盖文件信息）。
- 其他事件：`null` 或空对象。

---

## 创建虚拟文件

### 功能说明

createVirtualFile 实现创建虚拟文件功能，用于在指定路径创建一个不包含实际内容的虚拟文件记录。可通过请求体设置虚拟文件的媒体类型、元数据、标签、分类和大小等属性。

### 使用示例

```typescript
// 创建一个最简单的虚拟文件
const res = await smh.file.createVirtualFile({
    filePath: 'documents/reference.vfile',
    virtualFile: 1,
});

// 创建带有完整属性的虚拟文件
const res2 = await smh.file.createVirtualFile({
    filePath: 'documents/external-resource.vfile',
    virtualFile: 1,
    conflictResolutionStrategy: 'rename',
    createVirtualFileRequest: {
        contentType: 'application/pdf',
        metaData: {
            'source': 'external-system',
            'external-url': 'https://example.com/resource.pdf',
        },
        labels: ['外部资源', '参考文档'],
        category: 'reference',
        size: '1048576',
    },
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径，使用斜杠(/)分隔多级目录 | String | 是 |
| virtualFile | 固定标识，表示创建虚拟文件，固定值为 1 | Number | 是 |
| conflictResolutionStrategy | 文件名冲突时的处理方式：ask（返回 409）、rename（自动重命名，默认）、overwrite（覆盖） | String | 否 |
| accessToken | 访问令牌 | String | 否 |
| librarySecret | 访问媒体库密钥 | String | 否 |
| userId | 用户身份识别 | String | 否 |
| createVirtualFileRequest | 虚拟文件请求体 | Object | 否 |

**createVirtualFileRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|------|----------|------|----------|
| contentType | 虚拟文件的媒体类型，用于标识虚拟文件所代表的资源类型 | String | 否 |
| metaData | 自定义元数据键值对，key 为小写字符串 | Object | 否 |
| labels | 文件标签列表 | Array | 否 |
| category | 文件自定义分类，最大长度 16 字节 | String | 否 |
| size | 虚拟文件的大小（单位：字节），默认为 "0"；该值将用于存储配额计算 | String | 否 |

### 返回值说明

**HTTP 状态码：200 / 201**

创建成功，返回虚拟文件信息。

**响应示例**

```json
{
  "path": ["documents", "reference.vfile"],
  "type": "virtual"
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| path | 最终的虚拟文件路径，字符串数组。数组中的最后一个元素代表最终的文件名，其他元素代表每一级目录名。因为可能存在同名文件自动重命名，所以最终路径可能不等同于创建时指定的目标路径；如果为 null 则表示目标路径的某级父级目录已被删除 | Array \| null |
| type | 固定为 "virtual" | String |

---
