# 目录管理

本文介绍目录管理功能的示例代码和描述。包括目录的创建、查询、列出内容、复制、移动、删除、更新标签等操作。

## 注意事项

- 如果媒体库启用回收站功能，删除目录时会将目录及其下的文件移入回收站而非永久删除。
- 目录冲突时可选择询问（ask）或自动重命名（rename）两种处理策略。
- 当目录内容较多时，复制操作会以异步方式执行，返回任务 ID。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 列出目录或相簿内容（marker 翻页）

### 功能说明

listDirectory 实现列出目录或相簿内容，用于获取指定目录下的所有文件和子目录。

### 使用示例

```typescript
// 使用 marker/limit 分页查询（推荐）
const res = await smh.directory.listDirectory({
    libraryId: 'your-library-id',
    spaceId: 'your-space-id',
    filePath: '/images',
    byMarker: 1,
    marker: '',
    limit: 20,
    orderBy: 'creationTime',
    orderByType: 'desc',
    filter: 'onlyFile',
    sortType: 'union',
    withInode: 0,
    withFavoriteStatus: 0,
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('目录内容获取成功', res.data);
}

// 获取下一页：将上一次响应中的 nextMarker 作为 marker 传入
const res2 = await smh.directory.listDirectory({
    libraryId: 'your-library-id',
    spaceId: 'your-space-id',
    filePath: '/images',
    byMarker: 1,
    marker: res.data.nextMarker,
    limit: 20
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| filePath | 目录路径，对于多级目录，使用斜杠(/)分隔，例如 foo/bar | String | 是 |
| byMarker | 固定传 1，表示使用 marker 方式分页 | Number | 是 |
| marker | 用于顺序列出分页的标识，不传/为空则默认第一页 | String | 否 |
| limit | 用于顺序列出分页时本地列出的项目数限制，不传默认 20，最大 100 | Number | 否 |
| orderBy | 排序字段，可选值：name、modificationTime、size、creationTime、localCreationTime | String | 否 |
| orderByType | 排序方式，升序为 asc，降序为 desc | String | 否 |
| filter | 筛选方式，不传返回全部，onlyDir 只返回文件夹，onlyFile 只返回文件 | String | 否 |
| sortType | 排序方式，不传则文件和文件夹单独排序，先返回文件夹，后返回文件。union 文件和文件夹拉通排序 | String | 否 |
| withInode | 是否返回 inode（文件目录 ID），0 或 1，默认不返回 | Number | 否 |
| withFavoriteStatus | 是否返回收藏状态，0 或 1，默认不返回 | Number | 否 |
| userId | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回目录内容列表。

**响应示例**

```json
{
  "path": ["foo", "bar"],
  "nextMarker": "eyJ0eXBlIjoiZmlsZSIsIm5hbWUiOiJCTVcwLjMyNTE0NTE4ODkzMDYxNjk1LmpwZyJ9",
  "contents": [
    {
      "name": "sub-dir1",
      "path": ["foo", "bar", "sub-dir1"],
      "inode": "xxxx",
      "type": "dir",
      "creationTime": "2020-09-22T07:43:01.000Z",
      "modificationTime": "2020-09-22T07:43:01.000Z",
      "eTag": "0",
      "isFavorite": true,
      "labels": ["动物", "大象", "亚洲象"]
    },
    {
      "name": "file1.jpg",
      "type": "file",
      "creationTime": "2020-09-22T07:44:45.000Z",
      "modificationTime": "2020-09-22T07:44:45.000Z",
      "versionId": 2,
      "contentType": "image/jpg",
      "size": "1048576",
      "eTag": "xxx",
      "isFavorite": false,
      "crc64": "xxx",
      "metaData": {
        "x-smh-meta-foo": "bar"
      },
      "fileType": "powerpoint",
      "previewByDoc": true,
      "previewByCI": true,
      "previewAsIcon": true,
      "category": "image",
      "labels": ["动物", "大象", "亚洲象"],
      "localCreationTime": "2020-09-22T07:44:45.000Z",
      "localModificationTime": "2020-09-22T07:44:45.000Z"
    }
  ]
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| path | 返回当前请求的目录结构，如果当前请求的是根目录，则该字段为空数组 | Array |
| nextMarker | 用于顺序列出分页的标识，为空表示已翻页完毕 | String |
| contents | 目录内容列表 | Array |

---

## 列出目录或相簿内容（传统分页，不推荐）

### 功能说明

listDirectoryByPage 实现列出目录或相簿内容（传统分页），用于获取指定目录下的所有文件和子目录。


### 使用示例

```typescript
// 使用 page/pageSize 分页查询（传统分页，不建议深翻）
const res = await smh.directory.listDirectoryByPage({
    libraryId: 'your-library-id',
    spaceId: 'your-space-id',
    filePath: '/documents',
    byPage: 1,
    page: 1,
    pageSize: 20,
    orderBy: 'name',
    orderByType: 'asc',
    filter: 'onlyFile',
    sortType: 'union',
    withInode: 1,
    withFavoriteStatus: 1,
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('目录内容获取成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| filePath | 目录路径，对于多级目录，使用斜杠(/)分隔，例如 foo/bar | String | 是 |
| byPage | 固定传 1，表示使用 page 方式分页 | Number | 是 |
| page | 分页码，默认 1，最大翻页条目数（page*pageSize）为 10000 | Number | 否 |
| pageSize | 分页大小，默认 20，最大翻页条目数（page*pageSize）为 10000 | Number | 否 |
| orderBy | 排序字段，可选值：name、modificationTime、size、creationTime、localCreationTime | String | 否 |
| orderByType | 排序方式，升序为 asc，降序为 desc | String | 否 |
| filter | 筛选方式，不传返回全部，onlyDir 只返回文件夹，onlyFile 只返回文件 | String | 否 |
| sortType | 排序方式，不传则文件和文件夹单独排序，先返回文件夹，后返回文件。union 文件和文件夹拉通排序 | String | 否 |
| withInode | 是否返回 inode（文件目录 ID），0 或 1，默认不返回 | Number | 否 |
| withFavoriteStatus | 是否返回收藏状态，0 或 1，默认不返回 | Number | 否 |
| userId | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回目录内容列表。

**响应示例**

```json
{
  "path": ["foo", "bar"],
  "fileCount": 10,
  "subDirCount": 8,
  "totalNum": 18,
  "contents": [
    {
      "name": "sub-dir1",
      "path": ["foo", "bar", "sub-dir1"],
      "inode": "xxxx",
      "type": "dir",
      "creationTime": "2020-09-22T07:43:01.000Z",
      "modificationTime": "2020-09-22T07:43:01.000Z",
      "eTag": "0",
      "isFavorite": true,
      "labels": ["动物", "大象", "亚洲象"]
    },
    {
      "name": "file1.jpg",
      "type": "file",
      "creationTime": "2020-09-22T07:44:45.000Z",
      "modificationTime": "2020-09-22T07:44:45.000Z",
      "versionId": 2,
      "contentType": "image/jpg",
      "size": "1048576",
      "eTag": "xxx",
      "isFavorite": false,
      "crc64": "xxx",
      "metaData": {
        "x-smh-meta-foo": "bar"
      },
      "fileType": "powerpoint",
      "previewByDoc": true,
      "previewByCI": true,
      "previewAsIcon": true,
      "category": "image",
      "labels": ["动物", "大象", "亚洲象"],
      "localCreationTime": "2020-09-22T07:44:45.000Z",
      "localModificationTime": "2020-09-22T07:44:45.000Z"
    }
  ]
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| path | 返回当前请求的目录结构，如果当前请求的是根目录，则该字段为空数组 | Array |
| fileCount | 当前目录中的文件数（不包含孙子级） | Number |
| subDirCount | 当前目录中的子目录数（不包含孙子级） | Number |
| totalNum | 当前目录中的所有文件和子目录数量（不包含孙子级） | Number |
| contents | 目录内容列表 | Array |

**contents 数组元素字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| name | 目录或相簿名或文件名 | String |
| path | 文件具体目录 | Array |
| inode | 文件目录 ID | String |
| type | 条目类型：dir、file、image、video、symlink | String |
| versionId | 版本号 | Number |
| creationTime | ISO 8601 格式的日期与时间字符串，表示目录或相簿的创建时间或文件的上传时间 | String |
| modificationTime | 文件最近一次被覆盖的时间，或者目录内最近一次增删子目录或文件的时间 | String |
| contentType | 媒体类型 | String |
| size | 文件大小，字符串格式以避免精度问题 | String |
| eTag | 子目录或文件的 ETag | String |
| isFavorite | 是否被收藏，当 withFavoriteStatus = 1 时返回 | Boolean |
| crc64 | 文件的 CRC64-ECMA182 校验值，字符串格式 | String |
| metaData | 文件元数据信息 | Object |
| previewByDoc | 是否可通过 wps 预览 | Boolean |
| previewByCI | 是否可通过万象预览 | Boolean |
| previewAsIcon | 是否可用预览图作为 icon | Boolean |
| fileType | 文件类型：excel、powerpoint 等 | String |
| category | 文件分类，比如 image、video、doc 等 | String |
| labels | 简易文件标签，字符串数组 | Array |
| localCreationTime | 文件对应的本地创建时间 | String |
| localModificationTime | 文件对应的本地修改时间 | String |

---

## 查看文件、目录或相簿详情

### 功能说明

infoFileOrDirectory 实现查看文件、目录或相簿详情，用于获取指定路径的详细信息。此接口可同时用于查看文件或文件夹详情，路径如果为文件，则返回文件详情，如果为文件夹，则返回文件夹详情。

### 使用示例

```typescript
// 获取目录详情
const res = await smh.directory.infoFileOrDirectory({
    spaceId: 'your-space-id',
    filePath: '/documents',
    info: 1,
    withInode: 1,
    withFavoriteStatus: 1
});

if (res.status === 200) {
    console.log('详情获取成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件或目录路径 | String | 是 |
| info | 固定为 1 | Number | 是 |
| withInode | 是否返回 inode（文件目录 ID），0 或 1，默认不返回 | Number | 否 |
| withFavoriteStatus | 是否返回收藏状态，0 或 1，默认不返回 | Number | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回详细信息。

**响应示例**

```json
{
  "path": ["root", "folder"],
  "inode": "xxxx",
  "name": "folder",
  "type": "dir",
  "userId": "123",
  "creationTime": "2020-09-22T07:44:45.000Z",
  "modificationTime": "2020-09-22T07:44:45.000Z",
  "eTag": "1646106396946",
  "isFavorite": false,
  "category": "image" ,
  "labels": ["动物", "大象", "亚洲象"],
  "versionId": 1,
  "linkTo": "003638971146400200000a172672c200"
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| path | 完整路径 | Array |
| inode | 文件目录 ID | String |
| name | 目录或相簿名或文件名 | String |
| type | 条目类型：dir、file、image、video、symlink | String |
| userId | 创建人 ID | String |
| creationTime | ISO 8601 格式的日期与时间字符串，表示目录或相簿的创建时间或文件的上传时间 | String |
| modificationTime | 文件最近一次被覆盖的时间，或者目录内最近一次增删子目录或文件的时间 | String |
| contentType | 媒体类型（仅非目录或相簿返回） | String |
| size | 文件大小（仅非目录或相簿返回），字符串格式以避免精度问题 | String |
| eTag | 目录或文件的 ETag | String |
| isFavorite | 是否被收藏，当 withFavoriteStatus = 1 时返回 | Boolean |
| crc64 | 文件的 CRC64-ECMA182 校验值（仅非目录或相簿返回），字符串格式 | String |
| versionId | 版本号（仅非目录或相簿返回） | Number |
| metaData | 文件元数据信息（仅非目录或相簿返回） | Object |
| previewByDoc | 是否可通过 wps 预览（仅非目录或相簿返回） | Boolean |
| previewByCI | 是否可通过万象预览（仅非目录或相簿返回） | Boolean |
| previewAsIcon | 是否可用预览图作为 icon（仅非目录或相簿返回） | Boolean |
| fileType | 文件类型：excel、powerpoint 等（仅非目录或相簿返回） | String |
| labels | 简易文件标签列表 | Array |
| category | 文件自定义的分类 | String |
| linkTo | 符号链接指向的下一级文件的 inode，当文件为符号链接时返回 | String |

---

## 创建目录或相簿

### 功能说明

createDirectory 实现创建目录或相簿，用于在指定路径创建新的目录。会自动创建中间所需的各级父目录。

### 使用示例

```typescript
// 使用 ask 策略创建目录
const res = await smh.directory.createDirectory({
    spaceId: 'your-space-id',
    filePath: '/new-folder',
    conflictResolutionStrategy: 'ask',
    withInode: 1,
    userId: 'xxx'
});

if (res.status === 201) {
    console.log('目录创建成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目录路径 | String | 是 |
| conflictResolutionStrategy | 最后一级目录冲突时的处理方式，ask: 冲突时返回 HTTP 409，rename: 冲突时自动重命名最后一级目录，默认为 ask | String | 否 |
| withInode | 是否返回 inode（文件目录 ID），0 或 1，默认不返回 | Number | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：201**

创建成功。

**响应示例**

```json
{
  "path": ["foo", "bar (1)"],
  "inode": "b63393076d249110000631c316d9751a"
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| path | 最终的目录或相簿路径，可能因自动重命名与指定路径不同 | Array |
| inode | 最后一级文件目录 ID | String |

---

## 检查目录或相簿状态

### 功能说明

checkDirectoryStatus 实现检查目录或相簿状态，用于检查指定目录是否存在。

### 使用示例

```typescript
const res = await smh.directory.checkDirectoryStatus({
    spaceId: 'your-space-id',
    filePath: '/documents',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('目录存在');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目录路径 | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

目录或相簿存在。

---

## 复制目录或相簿

### 功能说明

copyDirectory 实现复制目录或相簿，用于将目录复制到目标路径。会自动创建中间所需的各级父目录。当目录内容较多时以异步方式复制，返回任务 ID。

### 使用示例

```typescript
// 异步复制（目录内容较多）
const res = await smh.directory.copyDirectory({
    spaceId: 'your-space-id',
    filePath: '/dest/image.png',
    conflictResolutionStrategy: 'ask',
    userId: 'xxx',
    copyDirectoryRequest: {
        copyFrom: '/source/xxx'
    }
});

if (res.status === 202) {
    console.log('异步复制任务创建成功', res.data);
}

// 同步复制（目录内容较少）
const res2 = await smh.directory.copyDirectory({
    spaceId: 'your-space-id',
    filePath: '/dest/copy-target',
    conflictResolutionStrategy: 'rename',
    userId: 'xxx',
    copyDirectoryRequest: {
        copyFrom: '/source/xxx'
    }
});

if (res2.status === 200) {
    console.log('同步复制成功，最终路径:');
} else if (res2.status === 204) {
    console.log('同步复制成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目标目录路径 | String | 是 |
| conflictResolutionStrategy | 最后一级目录冲突时的处理方式，ask: 冲突时返回 HTTP 409，rename: 冲突时自动重命名最后一级目录，默认为 ask | String | 否 |
| userId | 用户身份识别 | String | 否 |
| copyDirectoryRequest | 复制目录请求对象 | Object | 是 |

**copyDirectoryRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| copyFrom | 被复制的源目录或相簿路径 | String | 是 |

### 返回值说明

**HTTP 状态码：202**

当目录内容较多时以异步方式复制。

**响应示例**

```json
{
  "taskId": 10
}
```

**HTTP 状态码：204**

当目录内容较少时以同步方式复制且 conflictResolutionStrategy 为 ask。

**HTTP 状态码：200**

当目录内容较少时以同步方式复制且 conflictResolutionStrategy 为 rename。

**响应示例**

```json
{
  "path": ["foo", "bar (1)"]
}
```

---

## 重命名或移动目录或相簿

### 功能说明

moveDirectory 实现重命名或移动目录或相簿，用于将目录移动到目标路径或重命名目录。要求权限：admin、space_admin 或 move_directory。该接口的源和目标均需要指定完整的目录路径或相簿名；对于文件类型媒体库，源与目标可以跨越多层级多目录，来实现将目录移动到任意其他父目录下的功能，且支持同时修改目录名。会自动创建中间所需的各级父目录。

### 使用示例

```typescript
// 使用 ask 策略移动目录
const res = await smh.directory.moveDirectory({
    spaceId: 'your-space-id',
    filePath: '/dest/image.png',
    conflictResolutionStrategy: 'ask',
    userId: 'xxx',
    moveDirectoryRequest: {
        from: '/source/image.png'
    }
});

if (res.status === 204) {
    console.log('目录移动成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目标目录路径 | String | 是 |
| conflictResolutionStrategy | 最后一级目录冲突时的处理方式，ask: 冲突时返回 HTTP 409，rename: 冲突时自动重命名最后一级目录，默认为 ask | String | 否 |
| userId | 用户身份识别 | String | 否 |
| moveDirectoryRequest | 移动目录请求对象 | Object | 是 |

**moveDirectoryRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| from | 被重命名或移动的源目录或相簿路径 | String | 是 |

### 返回值说明

**HTTP 状态码：204**

重命名或移动成功（conflictResolutionStrategy 为 ask）。

**HTTP 状态码：200**

重命名或移动成功（conflictResolutionStrategy 为 rename）。

**响应示例**

```json
{
  "path": ["foo", "bar_new (1)"]
}
```

---

## 更新目录自定义标签

### 功能说明

updateDirectoryLabels 实现更新目录自定义标签，用于更新目录的标签信息。需要 admin 权限或 spaceAdmin 权限。

### 使用示例

```typescript
const res = await smh.directory.updateDirectoryLabels({
    spaceId: 'your-space-id',
    filePath: '/documents',
    update: 1,
    updateDirectoryLabelsRequest: {
        labels: ['tag1', 'tag2', 'important']
    }
});

if (res.status === 204) {
    console.log('目录标签更新成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目录路径 | String | 是 |
| update | 固定为 1 | Number | 是 |
| updateDirectoryLabelsRequest | 更新目录标签请求对象 | Object | 是 |

**updateDirectoryLabelsRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| labels | 文件标签列表，比如大象 | Array | 是 |

### 返回值说明

**HTTP 状态码：204**

更新成功，无响应体。

---

## 更新文件标签或分类

### 功能说明

updateFileLabels 实现更新文件标签或分类，用于更新文件的标签（Labels）或分类（Category）。需要 admin 权限或 spaceAdmin 权限。

### 使用示例

```typescript
// 更新文件标签和分类
const res = await smh.directory.updateFileLabels({
    spaceId: 'your-space-id',
    filePath: 'text.txt',
    update: 1,
    updateFileLabelsRequest: {
        labels: ['动物', '大象', '亚洲象'],
        category: 'image',
        localCreationTime: '2022-07-26T02:58:09Z',
        localModificationTime: '2022-07-26T02:58:09Z'
    }
});

if (res.status === 204) {
    console.log('文件标签更新成功');
}

// 只更新标签
const res2 = await smh.directory.updateFileLabels({
    spaceId: 'your-space-id',
    filePath: 'text.txt',
    update: 1,
    updateFileLabelsRequest: {
        labels: ['标签A', '标签B']
    }
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径 | String | 是 |
| update | 固定为 1 | Number | 是 |
| updateFileLabelsRequest | 更新文件标签请求对象 | Object | 是 |

**updateFileLabelsRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| labels | 文件标签列表，比如大象 | Array | 否 |
| category | 文件自定义的分类，string 类型，最大长度 16 字节 | String | 否 |
| localCreationTime | 文件对应的本地创建时间 | String | 否 |
| localModificationTime | 文件对应的本地修改时间 | String | 否 |

### 返回值说明

**HTTP 状态码：204**

更新成功，无响应体。

---

## 删除目录或相簿

### 功能说明

deleteDirectory 实现删除目录或相簿，用于删除指定目录及其下的所有文件。如果媒体库启用回收站功能，则该接口不会永久删除目录或相簿，而是将目录或相簿以及其下的文件移入回收站，可通过相关接口永久删除或恢复回收站内的目录或相簿，或直接清空回收站。

### 使用示例

```typescript
// 移入回收站
const res = await smh.directory.deleteDirectory({
    spaceId: 'your-space-id',
    filePath: '/old-folder',
    permanent: 0,
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('目录已移入回收站', res.data);
    console.log('回收站项目 ID:', res.data.recycledItemId);
} else if (res.status === 204) {
    console.log('目录已永久删除');
}

// 永久删除
const res2 = await smh.directory.deleteDirectory({
    spaceId: 'your-space-id',
    filePath: '/old-folder',
    permanent: 1,
    userId: 'xxx'
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目录路径 | String | 是 |
| permanent | 当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0 | Number | 否 |
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

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| recycledItemId | 回收站项目 ID，用于从回收站永久删除或恢复指定项目 | Number |

---

## 查询目录统计数据

### 功能说明

getDirectoryStats 实现查询目录统计数据，用于获取指定目录下的文件总大小、文件数量以及子目录数量。支持查询普通目录、回收站目录以及历史版本的统计量，适用于空间使用情况概览、目录大小展示等场景。

### 使用示例

```typescript
// 查询普通目录的统计数据
const res = await smh.directory.getDirectoryStats({
    spaceId: 'your-space-id',
    filePath: '/documents',
    stats: 1,
    statsType: 'normal',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('目录统计获取成功', res.data);
    // res.data.storage: 目录下所有文件总大小（字节）
    // res.data.fileCount: 目录下所有文件数量
    // res.data.dirCount: 目录下所有子目录数量
}

```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 目录路径，对于多级目录，使用斜杠(/)分隔，例如 foo/bar；对于根目录，该参数留空 | String | 是 |
| stats | 固定值为 1，表示查询目录统计数据 | Number | 是 |
| statsType | 统计类型，normal 表示普通目录统计量，recycle 表示回收站目录统计量，history 表示目录的历史版本统计量 | String | 是 |
| recycledId | 回收站项目 ID，查询回收站的统计量时为必选参数（根目录除外） | String | 否 |
| userId | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

查询成功，返回目录统计信息。

**响应示例**

```json
{
  "userId": "123",
  "statsType": "normal",
  "storage": 1048576000,
  "fileCount": 128,
  "dirCount": 16
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| userId | 创建人 ID | String |
| statsType | 查询类型，可选值：normal、recycle、history | String |
| storage | 目录下所有文件总大小（字节），包含子目录文件；查询类型为历史版本时，为目录下所有文件历史版本总大小（字节） | Number |
| fileCount | 目录下所有文件数量，包含子目录文件；查询类型为历史版本时，为目录下所有文件的历史版本个数 | Number |
| dirCount | 目录下所有子目录数量；查询类型为历史版本时，该值始终为 0 | Number |

---
