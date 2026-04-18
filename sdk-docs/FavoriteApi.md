# 收藏管理

本文介绍收藏管理功能的示例代码和描述。包括收藏文件、查看收藏列表和取消收藏三个部分。

## 注意事项

- 若您使用收藏管理功能，需要具有相应空间的读写权限，且初始化创建access_token时必须要传userId，否则会没有权限。
- 查看收藏列表支持两种分页方式：marker/limit 方式和 page/pageSize 方式，两种方式不能同时使用。

## 前期准备

开始操作前，确保您已经完成了 SDK 初始化。

---

## 收藏文件

### 功能说明

createFavorite 实现收藏指定空间的文件或目录。支持通过文件路径或文件 ID（inode）进行收藏操作。

### 使用示例

```typescript
// 通过路径收藏
const res = await smh.favorite.createFavorite({
    spaceId: 'your-space-id',
    createFavoriteRequest: {
        path: '/documents/report.docx'
    }
});

// 通过 inode 收藏
const res2 = await smh.favorite.createFavorite({
    spaceId: 'your-space-id',
    createFavoriteRequest: {
        inode: '46bb40dd044f66340006425bd913af6f'
    }
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| createFavoriteRequest | 收藏请求对象 | Object | 是 |

**createFavoriteRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| path | 文件或目录的路径 | String | 否* |
| inode | 文件或目录的 ID | String | 否* |

*注意：path 和 inode 二选一，至少提供一个；如果同时提供，以 inode 为准。

### 返回值说明

**HTTP 状态码：200**

收藏成功，返回文件或目录的 ID。

**响应示例**

```json
{
  "inode": "46bb40dd044f66340006425bd913af6f"
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| inode | 文件或目录的 ID | String |

---

## 查看收藏列表

### 功能说明

listFavorite 实现查看指定空间的收藏列表，支持分页、排序和路径返回等功能。

### 使用示例

```typescript
// 使用 marker/limit 分页方式
const res = await smh.favorite.listFavorite({
    spaceId: 'your-space-id',
    marker: 'xxx',
    limit: 20,
    orderBy: 'favoriteTime',
    orderByType: 'desc',
    withPath: true
});

if (res.status === 200) {
    console.log('获取收藏列表成功', res.data);
    console.log('下一页标识:', res.data.nextMarker);
    res.data.contents.forEach(item => {
        console.log(`文件名: ${item.name}, 收藏时间: ${item.favoriteTime}`);
    });
}

// 使用 page/pageSize 分页方式
const res2 = await smh.favorite.listFavorite({
    spaceId: 'your-space-id',
    page: 1,
    pageSize: 20,
    orderBy: 'favoriteTime',
    orderByType: 'desc'
});

if (res2.status === 200) {
    console.log('总数:', res2.data.totalNum);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| marker | 用于顺序列出分页的标识，不传默认第一页。不能与 page、pageSize 参数同时使用 | String | 否 |
| limit | 用于顺序列出分页时本地列出的项目数限制，默认为 20。不能与 page、pageSize 参数同时使用 | Number | 否 |
| page | 分页码，默认第一页。不能与 marker、limit 参数同时使用 | Number | 否 |
| pageSize | 分页大小，默认 20。不能与 marker、limit 参数同时使用 | Number | 否 |
| orderBy | 排序字段，按收藏时间排序为 `favoriteTime`（默认），目前仅支持按收藏时间排序 | String | 否 |
| orderByType | 排序方式，升序为 `asc`，降序为 `desc`（默认） | String | 否 |
| withPath | 是否返回文件路径，`true` 表示返回，`false` 表示不返回（默认） | Boolean | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回收藏列表。

**响应示例**

```json
{
  "nextMarker": "xxx",
  "totalNum": 50,
  "contents": [
    {
      "spaceId": "space-id-1",
      "type": "file",
      "inode": "46bb40dd044f66340006425bd913af6f",
      "name": "文档.docx",
      "size": "2048576",
      "creationTime": "2025-12-01T08:00:00Z",
      "modificationTime": "2025-12-02T10:30:00Z",
      "favoriteTime": "2025-12-03T14:20:00Z",
      "fileType": "document",
      "path": ["文档", "文档.docx"],
      "userId": "test-user-id",
      "eTag": "abc123def456",
      "contentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "crc64": "1234567890123456789",
      "previewByDoc": true,
      "previewByCI": false,
      "previewAsIcon": true
    }
  ]
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| nextMarker | 用于顺序列出分页的标识，仅当使用 marker/limit 方式分页且当前不为最后一页时会返回 | String |
| totalNum | 收藏文件目录的总数，仅当使用 page/pageSize 方式分页时会返回 | Number |
| contents | 收藏的文件目录集合，数组格式 | Array |

**contents 数组元素说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| spaceId | 空间 ID | String |
| type | 文件目录类型，可选值：`dir`（目录）、`file`（文件）。如果文件已被删除，则不返回该字段 | String |
| inode | 文件或目录 ID | String |
| name | 文件或目录名称。如果文件已被删除，则返回空字符串 | String |
| size | 文件的大小（单位：字节）。如果为目录或文件已被删除，则不返回该字段 | String |
| creationTime | 文件或目录的创建时间，ISO 8601 格式。如果文件已被删除，则不返回该字段 | String |
| modificationTime | 文件最近一次被覆盖的时间，ISO 8601 格式。如果文件已被删除，则不返回该字段 | String |
| favoriteTime | 文件或目录的收藏时间，ISO 8601 格式 | String |
| fileType | 文件类型。如果为目录或文件已被删除，则不返回该字段 | String |
| path | 文件目录路径，字符串数组格式。仅当请求参数 `withPath` 为 `true` 时返回该字段 | Array |
| userId | 收藏人 ID | String |
| eTag | 目录或文件的 ETag | String |
| virusAuditStatus | 查毒状态，可选值：0-6 | Number |
| labels | 文件标签数组 | Array |
| category | 自定义文件分类，如 image、video、doc 等 | String |
| contentType | 媒体类型（仅非目录或相簿返回） | String |
| crc64 | 文件的 CRC64-ECMA182 校验值 | String |
| previewByDoc | 是否可通过 WPS 预览（仅非目录或相簿返回） | Boolean |
| previewByCI | 是否可通过万象预览（仅非目录或相簿返回） | Boolean |
| previewAsIcon | 是否可用预览图作为 icon（仅非目录或相簿返回） | Boolean |
| removedByQuota | 是否因为配额超限而被删除文件（仅非目录或相簿返回） | Boolean |
| metaData | 元数据（仅非目录或相簿返回） | Object |

---

## 取消收藏

### 功能说明

deleteFavorite 实现取消收藏指定空间的文件或目录。支持通过文件路径或文件 ID（inode）进行取消收藏操作。

### 使用示例

```typescript
// 通过路径取消收藏
const res = await smh.favorite.deleteFavorite({
    spaceId: 'your-space-id',
    cancel: 1,
    deleteFavoriteRequest: {
        path: '/documents/report.docx'
    }
});

// 通过 inode 取消收藏
const res2 = await smh.favorite.deleteFavorite({
    spaceId: 'your-space-id',
    cancel: 1,
    deleteFavoriteRequest: {
        inode: '46bb40dd044f66340006425bd913af6f'
    }
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| cancel | 取消收藏标志，固定传递 `1` 表示执行取消收藏操作 | Number | 是 |
| deleteFavoriteRequest | 取消收藏请求对象 | Object | 是 |

**deleteFavoriteRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| path | 文件或目录的路径 | String | 否 |
| inode | 文件或目录的 ID | String | 否 |

*注意：path 和 inode 二选一，至少提供一个；如果同时提供，以 inode 为准。

### 返回值说明

**HTTP 状态码：204**

取消收藏成功，无响应体。

---
