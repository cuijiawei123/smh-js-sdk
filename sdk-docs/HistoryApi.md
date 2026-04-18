# 历史版本管理

本文介绍历史版本管理功能的示例代码和描述。包括查看历史版本列表、查询历史版本配置信息、设置历史版本配置信息、设置历史版本为最新版本、删除历史版本和清空历史版本六个部分。

## 注意事项

- 历史版本功能需要先通过设置历史版本配置信息接口开启。
- 历史版本配置设置生效可能有 1 分钟左右延迟。
- 清空历史版本接口会清空整个 library 全部文件的历史版本，相应的空间会释放，不可找回数据，请谨慎操作！
- 清空历史版本接口有频控限制，每分钟最多调用 1 次，请勿频繁调用。
- 历史版本合并时间可以减少冗余的历史版本，在指定时间内的覆盖操作只会生成 1 个历史版本。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 查看历史版本列表

### 功能说明

listHistory 实现查看历史版本列表，用于查询指定文件的所有历史版本信息。支持分页查询和排序。

### 使用示例

```typescript
// 使用分页参数查询
const res1 = await smh.history.listHistory({
    spaceId: 'your-space-id',
    filePath: 'documents/report.docx',
    page: 1,
    pageSize: 10,
    orderBy: 'creationTime',
    orderByType: 'desc'
});

// 使用 marker 分页查询
const res2 = await smh.history.listHistory({
    spaceId: 'your-space-id',
    filePath: 'images/photo.jpg',
    marker: 'next-marker-value',
    limit: 20
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filePath | 文件路径，对于多级目录，使用斜杠(/)分隔，例如 foo/bar.txt | String | 是 |
| marker | 用于顺序列出分页的标识 | String | 否 |
| limit | 用于顺序列出分页时本地列出的项目数限制，默认为 20 | Number | 否 |
| page | 分页码，默认第一页 | Number | 否 |
| pageSize | 分页大小，默认 20 | Number | 否 |
| orderBy | 排序字段，按文件 id 排序为 id，按创建时间排序为 creationTime，默认为 id | String | 否 |
| orderByType | 排序方式，升序为 asc，降序为 desc，默认为 desc | String | 否 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回历史版本列表。

**响应示例**

```json
{
  "totalNum": 2,
  "contents": [
    {
      "createdBy": "123",
      "creationWay": 1,
      "version": 2,
      "isLatestVersion": true,
      "name": "test",
      "size": 2345,
      "crc64": "4937027024332829001",
      "contentType": "image/png",
      "creationTime": "2021-08-12T08:13:55.000Z",
      "setLatestTime": "2021-08-12T08:13:55.000Z"
    },
    {
      "id": 1,
      "createdBy": "456",
      "creationWay": 1,
      "version": 2,
      "isLatestVersion": false,
      "name": "test",
      "size": 2300,
      "crc64": "8237027023432829000",
      "contentType": "image/png",
      "creationTime": "2021-08-12T08:13:54.000Z",
      "setLatestTime": "2021-08-12T08:13:54.000Z"
    }
  ]
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| totalNum | 历史版本总数，采用 page 模式才会返回该字段 | Number |
| hasMore | 是否有更多搜索结果 | Boolean |
| nextMarker | 用于获取后续页的分页标识，仅当 hasMore 为 true 时才返回该字段 | String |
| contents | 历史版本列表 | Array |

**contents 数组元素字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| id | 历史版本 ID，最新历史版本不返回这一字段 | Number |
| createdBy | 创建人 ID | String |
| creationWay | 创建方式，0：创建，1：更新 | Number |
| version | 版本号 | Number |
| isLatestVersion | 是否最新版本 | Boolean |
| name | 目录或相簿名或文件名 | String |
| size | 历史版本文件大小 | Number |
| crc64 | 文件的 CRC64-ECMA182 校验值，字符串格式 | String |
| contentType | 文件元类型 | String |
| creationTime | ISO 8601 格式的日期与时间字符串，表示文件的创建时间 | String |
| setLatestTime | 设置为最新版本的时间 | String |

---

## 查询历史版本配置信息

### 功能说明

getHistoryConfig 实现查询历史版本配置信息，用于获取当前媒体库的历史版本配置。权限要求：admin 权限。

### 使用示例

```typescript
const res = await smh.history.getHistoryConfig({});

if (res.status === 200) {
    console.log('历史版本配置获取成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回历史版本配置信息。

**响应示例**

```json
{
  "enableFileHistory": false,
  "fileHistoryCount": 20,
  "fileHistoryExpireDay": 30,
  "mergeInterval": 10
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| enableFileHistory | 是否打开历史版本 | Boolean |
| fileHistoryCount | 历史版本最大数量，范围：1-999 个 | Number |
| fileHistoryExpireDay | 历史版本过期时间，范围：0-999 天，0 表示永不过期 | Number |
| mergeInterval | 历史版本合并时间，即在 mergeInterval 秒内的覆盖操作，只会生成 1 个历史版本 | Number |

---

## 设置历史版本配置信息

### 功能说明

setHistoryConfig 实现设置历史版本配置信息，用于配置媒体库的历史版本功能。权限要求：admin 权限。

### 使用示例

```typescript
const res = await smh.history.setHistoryConfig({
    setHistoryConfigRequest: {
        enableFileHistory: true,
        fileHistoryCount: 10,
        fileHistoryExpireDay: 30,
        mergeInterval: 60
    }
});

if (res.status === 204) {
    console.log('历史版本配置设置成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| setHistoryConfigRequest | 设置历史版本配置请求对象 | Object | 是 |
| userId | 用户身份识别 | String | 否 |

**setHistoryConfigRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| enableFileHistory | 是否打开历史版本，默认为 false | Boolean | 否 |
| fileHistoryCount | 历史版本最大数量，范围：1-999 个；第一次设置必填 | Number | 否 |
| fileHistoryExpireDay | 历史版本过期时间，范围：0-999 天，0 表示永不过期；第一次设置必填 | Number | 否 |
| mergeInterval | 历史版本合并时间，范围：0 或 5-600，默认为 0 秒（不合并） | Number | 否 |

### 返回值说明

**HTTP 状态码：204**

设置成功，无响应体。

---

## 设置历史版本为最新版本

### 功能说明

setHistoryLatest 实现设置历史版本为最新版本。权限要求：admin、space_admin 或 set_history_latest 权限。

### 使用示例

```typescript
const res = await smh.history.setHistoryLatest({
    spaceId: 'your-space-id',
    historyId: '1'
});

if (res.status === 200) {
    console.log('历史版本已设置为最新版本', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| historyId | 历史版本 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

设置成功，返回最新版本文件信息。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| name | 文件名 | String |
| type | 文件类型 | String |
| creationTime | 创建时间 | String |
| modificationTime | 修改时间 | String |
| setLatestTime | 设置为最新版本的时间 | String |
| contentType | 媒体类型 | String |
| size | 最新版本的文件大小 | Number |
| eTag | 文件 ETag | String |
| crc64 | 文件的 CRC64-ECMA182 校验值 | String |
| previewByDoc | 是否可通过 wps 预览 | Boolean |
| previewByCI | 是否可通过万象预览 | Boolean |
| previewAsIcon | 是否可用预览图当做 icon | Boolean |
| fileType | 文件类型 | String |

---

## 删除历史版本

### 功能说明

deleteHistory 实现删除历史版本。权限要求：delete_history、admin 或 space_admin 权限。

### 使用示例

```typescript
const res = await smh.history.deleteHistory({
    spaceId: 'your-space-id',
    requestBody: ['1', '2', '3']
});

if (res.status === 204) {
    console.log('历史版本删除成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| requestBody | 删除的 HistoryId 集合，单次最多传入 100 个 | Array | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：204**

删除成功，无响应体。

---

## 清空历史版本

### 功能说明

emptyHistory 实现清空历史版本。请求此接口时，需要先关闭历史版本。注意：此接口会清空整个 library 全部文件的历史版本，不可找回数据，请谨慎操作！权限要求：admin 权限。

### 使用示例

```typescript
const res = await smh.history.emptyHistory({});

if (res.status === 202) {
    console.log('历史版本清空任务已创建', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：202**

删除成功，返回异步任务 ID。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| taskId | 异步任务 ID | Number |

---
