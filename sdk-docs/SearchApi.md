# 搜索文件

本文介绍搜索目录与文件功能的示例代码和描述。该接口支持按关键字、文件类型、文件大小、修改时间等多种条件进行搜索，并支持排序和分页。

## 注意事项

- 若您使用搜索功能，需要具有相应空间的读权限。
- 本接口QPS使用上限为10，此接口不可用于业务的高频操作页面，比如空间首页列表的查询等，如有更大QPS的需求请提工单联系智能媒资托管团队。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 搜索目录与文件

### 功能说明

searchFs 实现搜索目录与文件功能，支持按关键字、文件类型、文件大小、修改时间等多种条件进行搜索，并支持排序和分页。

### 使用示例

```typescript
const res = await smh.search.searchFs({
    libraryId: 'your-library-id',
    spaceId: 'space-id-1',
    withFavoriteStatus: 1,
    limit: 20,
    marker: 'FnMwV3NweXJOU2hTOTRpTnF0TW9EZVEeVUFhYUl5TGFSaTZtZUpDcEpUcEtxdzo3NjQ3NjU1',
    searchFsRequest: {
        keywords: ['报告文档', '工作文档'],
        inExtnames: ['.pdf', '.doc', '.docx'],
        excludeExtnames: ['.xls', '.xlsx'],
        fileTypes: ['file', 'dir'],
        minFileSize: 1024,
        maxFileSize: 10485760,
        modificationTimeStart: '2025-01-01T00:00:00.000Z',
        modificationTimeEnd: '2025-12-31T23:59:59.000Z',
        orderBy: 'modificationTime',
        orderByType: 'desc',
        labels: ['重要'],
        categories: ['document']
    }
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| accessToken | 访问令牌 | String | 是 |
| userId | 用户身份识别 | String | 否 |
| marker | 用于顺序列出分页的标识 | String | 否 |
| limit | 用于顺序列出分页时本地列出的项目数限制，取值范围[1,100] | Number | 否 |
| withFavoriteStatus | 是否返回收藏状态，0 或 1 | Number | 否 |
| searchFsRequest | 搜索请求对象 | Object | 否 |

**searchFsRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|------|----------|------|----------|
| keywords | 搜索关键字，字符串数组，多个关键字之间为"或"的关系 | Array | 否 |
| inExtnames | 搜索文件后缀，字符串数组 | Array | 否 |
| excludeExtnames | 不包含的搜索文件后缀，字符串数组 | Array | 否 |
| fileTypes | 文件类型，可选值：file、dir、symlink | Array | 否 |
| minFileSize | 搜索文件大小范围（最小值），单位：字节 | Number | 否 |
| maxFileSize | 搜索文件大小范围（最大值），单位：字节 | Number | 否 |
| modificationTimeStart | 搜索更新时间范围（开始时间），ISO 8601 格式 | String | 否 |
| modificationTimeEnd | 搜索更新时间范围（结束时间），ISO 8601 格式 | String | 否 |
| orderBy | 排序字段：name、modificationTime、size、creationTime 等 | String | 否 |
| orderByType | 排序方式：asc、desc | String | 否 |
| labels | 简易文件标签，字符串数组 | Array | 否 |
| categories | 文件自定义分类信息，字符串数组 | Array | 否 |

### 返回值说明

**HTTP 状态码：200**

搜索成功，返回搜索结果。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| nextMarker | 用于获取后续页的分页标识，为空时表示已经翻页完毕 | String |
| contents | 搜索结果数组，可能为空数组 | Array |

**contents 数组元素说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| type | 条目类型：dir、file、image、video、symlink | String |
| inode | 文件目录 ID | String |
| name | 目录或相簿名或文件名 | String |
| creationTime | 创建时间或上传时间 | String |
| modificationTime | 最近修改时间 | String |
| contentType | 媒体类型 | String |
| versionId | 版本号 | Number |
| size | 文件大小，字符串格式 | String |
| isFavorite | 是否被收藏 | Boolean |
| eTag | 文件 ETag | String |
| crc64 | 文件的 CRC64-ECMA182 校验值 | String |
| metaData | 文件元数据信息 | Object |
| userId | 创建/更新者用户 ID | String |
| previewByDoc | 是否可通过 WPS 预览 | Boolean |
| previewByCI | 是否可通过万象预览 | Boolean |
| previewAsIcon | 是否可使用预览图当做 icon | Boolean |
| labels | 简易文件标签 | Array |
| category | 自定义文件分类 | String |

---
