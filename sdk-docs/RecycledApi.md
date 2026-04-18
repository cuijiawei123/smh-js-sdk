# 回收站管理

本文介绍回收站管理功能的示例代码和描述。包括列出回收站项目、查看文件详情、预览、恢复、永久删除、设置生命周期和清空回收站等功能。

## 注意事项

- 若您使用回收站管理功能，需要具有相应空间的读权限。
- 恢复回收站项目需要 admin、space_admin 或 restore_recycled 权限。
- 永久删除回收站项目需要 admin、space_admin 或 delete_recycled 权限。
- 清空回收站时，回收站内的文件将首先在回收站内不可见，删除和释放空间的操作将异步执行。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 列出回收站项目（marker 翻页）

### 功能说明

recycleList 实现列出回收站项目。

### 使用示例

```typescript
const res = await smh.recycled.recycleList({
    libraryId: 'your-library-id',
    spaceId: 'your-space-id',
    byMarker: 1,
    marker: '',
    limit: 20,
    orderBy: 'removalTime',
    orderByType: 'desc',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('回收站项目列表', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| byMarker | 固定传 1，表示使用 marker 方式分页 | Number | 是 |
| marker | 用于顺序列出分页的标识 | String | 否 |
| limit | 分页限制，不传默认 20，最大 100 | Number | 否 |
| orderBy | 排序字段：name、modificationTime、size、removalTime、remainingTime | String | 否 |
| orderByType | 排序方式：asc、desc | String | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回回收站项目列表。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| nextMarker | 用于顺序列出分页的标识，为空表示已翻页完毕 | String |
| contents | 回收站项目列表 | Array |

**contents 数组元素说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| recycledItemId | 回收站 ID | Number |
| originalPath | 原始路径 | Array |
| spaceId | 空间 ID | String |
| size | 文件大小，字符串格式 | String |
| previewByDoc | 是否可通过 WPS 预览 | Boolean |
| previewByCI | 是否可通过万象预览 | Boolean |
| previewAsIcon | 是否可用预览图当做 icon | Boolean |
| fileType | 文件类型 | String |
| name | 文件名 | String |
| type | 条目类型：dir、file、image、video | String |
| creationTime | 创建时间 | String |
| modificationTime | 修改时间 | String |
| removalTime | 删除时间 | String |
| remainingTime | 剩余天数 | Number |

---

## 列出回收站项目（page翻页）

### 功能说明

recycleListByPage 实现列出回收站项目（传统分页，不推荐）。

### 使用示例

```typescript
const res = await smh.recycled.recycleListByPage({
    libraryId: 'your-library-id',
    spaceId: 'your-space-id',
    byPage: 1,
    page: 1,
    pageSize: 20,
    orderBy: 'removalTime',
    orderByType: 'desc',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('回收站项目列表', res.data);
    console.log('总数:', res.data.totalNum);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| byPage | 固定传 1 | Number | 是 |
| page | 分页码，默认 1 | Number | 否 |
| pageSize | 分页大小，默认 20 | Number | 否 |
| orderBy | 排序字段 | String | 否 |
| orderByType | 排序方式 | String | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| totalNum | 回收站所有文件和文件夹总数 | Number |
| contents | 回收站项目列表 | Array |

---

## 查看回收站文件详情

### 功能说明

recycleInfo 实现查看回收站文件详情。

### 使用示例

```typescript
const res = await smh.recycled.recycleInfo({
    spaceId: 'your-space-id',
    recycledItemId: 451,
    info: 1
});

if (res.status === 200) {
    console.log('文件详情', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| recycledItemId | 回收站 ID | Number | 是 |
| info | 获取文件详情，固定值为 1 | Number | 是 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回文件详情（包含 cosUrl、contentType、size、crc64、metaData、labels 等字段）。

---

## 预览回收站项目

### 功能说明

recyclePreview 实现预览回收站中的文档、图片、视频等文件。

### 使用示例

```typescript
const res = await smh.recycled.recyclePreview({
    spaceId: 'your-space-id',
    recycledItemId: 451,
    preview: 1,
    type: 'pic',
    size: 128
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| recycledItemId | 回收站 ID | Number | 是 |
| preview | 预览标志，固定值为 1 | Number | 是 |
| type | 文档预览方式，pic 以 JPG 格式预览，否则以 HTML 格式 | String | 否 |
| size | 图片或视频封面的缩放大小 | Number | 否 |
| scale | 等比例缩放百分比 | Number | 否 |
| widthSize | 缩放宽度 | Number | 否 |
| heightSize | 缩放高度 | Number | 否 |
| frameNumber | gif 文件降帧的帧数 | Number | 否 |

### 返回值说明

**HTTP 状态码：302**

获取成功，重定向到预览 URL。

---

## 恢复指定回收站项目

### 功能说明

recycleRestore 实现恢复指定回收站项目。

### 使用示例

```typescript
const res = await smh.recycled.recycleRestore({
    spaceId: 'your-space-id',
    recycledItemId: 451,
    restore: 1,
    conflictResolutionStrategy: 'rename',
    restorePathStrategy: 'fallbackToRoot'
});

if (res.status === 200) {
    console.log('恢复成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| recycledItemId | 回收站项目 ID | Number | 是 |
| restore | 恢复标志，固定值为 1 | Number | 是 |
| conflictResolutionStrategy | 路径冲突处理方式：ask、rename、overwrite | String | 否 |
| restorePathStrategy | 恢复路径策略：originalPath、fallbackToRoot | String | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

恢复成功，返回最终文件路径。

---

## 批量恢复回收站项目

### 功能说明

recycleRestoreBatch 实现批量恢复回收站项目。

### 使用示例

```typescript
const res = await smh.recycled.recycleRestoreBatch({
    spaceId: 'your-space-id',
    restore: 1,
    restorePathStrategy: 'originalPath',
    recycleRestoreBatchRequest: [1, 2, 3, 4, 5]
});

if (res.status === 200) {
    console.log('同步恢复全部成功', res.data);
} else if (res.status === 202) {
    console.log('异步恢复，任务ID:', res.data.taskId);
} else if (res.status === 207) {
    console.log('部分恢复成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| restore | 恢复标志，固定值为 1 | Number | 是 |
| restorePathStrategy | 恢复路径策略：originalPath、fallbackToRoot | String | 否 |
| userId | 用户身份识别 | String | 否 |
| recycleRestoreBatchRequest | 回收站项目 ID 数组 | Array | 是 |

### 返回值说明

**HTTP 状态码：200** - 同步恢复全部成功  
**HTTP 状态码：202** - 异步方式恢复，返回 taskId  
**HTTP 状态码：207** - 部分或全部执行失败

---

## 永久删除指定回收站项目

### 功能说明

recyclePurge 实现永久删除指定回收站项目。删除后无法恢复。

### 使用示例

```typescript
const res = await smh.recycled.recyclePurge({
    spaceId: 'your-space-id',
    recycledItemId: 451
});

if (res.status === 204) {
    console.log('永久删除成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| recycledItemId | 回收站项目 ID | Number | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：204**

删除成功，无响应体。

---

## 批量永久删除回收站项目

### 功能说明

recyclePurgeBatch 实现批量永久删除回收站项目。

### 使用示例

```typescript
const res = await smh.recycled.recyclePurgeBatch({
    spaceId: 'your-space-id',
    _delete: 1,
    recyclePurgeBatchRequest: [1, 2, 3, 4, 5]
});

if (res.status === 204) {
    console.log('批量永久删除成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| _delete | 永久删除标志，固定值为 1 | Number | 是 |
| userId | 用户身份识别 | String | 否 |
| recyclePurgeBatchRequest | 回收站项目 ID 数组 | Array | 是 |

### 返回值说明

**HTTP 状态码：204**

删除成功，无响应体。

---

## 设置回收站生命周期

### 功能说明

recycleSetLifecycle 实现设置回收站生命周期。

### 使用示例

```typescript
const res = await smh.recycled.recycleSetLifecycle({
    spaceId: 'your-space-id',
    lifecycle: 1,
    recycleSetLifecycleRequest: {
        retentionDays: 10
    }
});

if (res.status === 204) {
    console.log('设置回收站生命周期成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| lifecycle | 设置回收站生命周期标志，固定值为 1 | Number | 是 |
| recycleSetLifecycleRequest | 生命周期设置对象 | Object | 是 |

**recycleSetLifecycleRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| retentionDays | 回收站保留天数，取值范围：0 < retentionDays <= 10000 | Number | 是 |

### 返回值说明

**HTTP 状态码：204**

修改成功，无响应体。

---

## 清空回收站

### 功能说明

recycleEmpty 实现清空回收站。回收站内的文件将首先在回收站内不可见，删除和释放空间的操作将异步执行。

### 使用示例

```typescript
const res = await smh.recycled.recycleEmpty({
    spaceId: 'your-space-id'
});

if (res.status === 204) {
    console.log('清空回收站成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：204**

删除成功，无响应体。

---
