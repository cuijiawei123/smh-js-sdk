# 搜索文件

本文介绍搜索目录与文件功能的示例代码和描述。该接口支持按关键字、文件类型、文件大小、修改时间等多种条件进行搜索，并支持排序和分页。

## 注意事项

- 该功能需开通白名单后使用；未开通时返回 HTTP 4xx 并携带参数错误说明。
- `type=filecontent` 需要该媒体库额外开通全文索引能力（同属白名单范畴），未开通时返回 HTTP 4xx。
- 首次请求不带 marker；后续翻页使用响应体中的 nextMarker；nextMarker 为空时表示翻页完毕。
- 本接口 QPS 使用上限为 10，不可用于业务的高频操作页面（如空间首页列表查询），如有更大 QPS 需求请提工单联系智能媒资托管团队。
- 停用词过滤：`type=filecontent` 下 keywords 中的停用词会被服务端自动过滤（若 keywords 全部被过滤则 HTTP 200 返回空 contents，而非 HTTP 400）；`type=filename` 不做停用词过滤。
- 服务端内部配置不一致时可能返回 HTTP 500（由服务方保障，调用方重试或联系运维即可）。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 搜索目录与文件 - 基本检索（MI）

### 功能说明

searchFs 实现搜索目录与文件功能，支持 `type=filename`（按文件名命中）和 `type=filecontent`（按文件正文内容全文检索）两种子模式，并支持按关键字、文件类型、文件大小、修改时间等多种条件进行搜索，支持排序和分页。

### 使用示例

#### type=filename（默认，按文件名检索）

```typescript
const res = await smh.search.searchFs({
    libraryId: 'your-library-id',
    spaceId: 'space-id-1',
    withFavoriteStatus: 1,
    withInode: 1,
    limit: 20,
    marker: 'FnMwV3NweXJOU2hTOTRpTnF0TW9EZVEeVUFhYUl5TGFSaTZtZUpDcEpUcEtxdzo3NjQ3NjU1',
    searchFsRequest: {
        type: 'filename',
        keywords: ['报告文档', '工作文档'],
        scope: '/documents',
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

#### type=filecontent（全文关键字检索）

```typescript
const res = await smh.search.searchFs({
    libraryId: 'your-library-id',
    spaceId: 'space-id-1',
    withInode: 1,
    limit: 20,
    searchFsRequest: {
        type: 'filecontent',
        keywords: ['季度报告', '营收数据'],
        inExtnames: ['.pdf', '.docx', '.txt'],
        fileTypes: ['file'],
    }
});
// 响应中每条结果会包含 text（命中片段）、textPage（页码）、searchScore（匹配得分）、contentHighlight（高亮片段）
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| accessToken | 访问令牌 | String | 是 |
| userId | 用户身份识别 | String | 否 |
| marker | 用于顺序列出分页的标识，建议将 marker 放入请求体中传入 | String | 否 |
| limit | 用于顺序列出分页时本地列出的项目数限制，取值范围[1,100] | Number | 否 |
| withFavoriteStatus | 是否返回收藏状态，0 或 1；仅 type=filename 生效，type=filecontent 下即使传入 1 也不会返回 isFavorite | Number | 否 |
| withInode | 是否返回每条结果的 inode 字段，0 或 1，默认不返回 | Number | 否 |
| searchFsRequest | 搜索请求对象 | Object | 否 |

**searchFsRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|------|----------|------|----------|
| type | 搜索子模式，取值 `filename`（基础检索，按文件名命中）或 `filecontent`（全文关键字检索，按文件正文内容命中）；默认 `filename` | String | 否 |
| keywords | 搜索关键字，字符串数组（元素间为"或"关系），数组长度上限 100；type=filename 下按文件名命中，不做停用词过滤；type=filecontent 下按文件正文内容全文检索，服务端会自动过滤停用词 | Array | 否 |
| scope | 搜索范围，指定搜索的目录，如搜索根目录可指定为空字符串、"/"或不指定该字段；type=filecontent 下路径匹配能力有限，建议不填 | String | 否 |
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

| 字段 | 说明 | 类型 | 备注 |
|------|------|------|------|
| type | 条目类型：dir、file、image、video、symlink | String | |
| inode | 文件或目录 ID | String | 需带 with_inode=1 才会返回 |
| name | 目录或相簿名或文件名 | String | |
| creationTime | 创建时间或上传时间（ISO 8601） | String | |
| modificationTime | 最近修改时间 | String | |
| contentType | 媒体类型 | String | 仅 file 类型返回 |
| versionId | 版本号 | Number | 仅 file 类型返回 |
| size | 文件大小，字符串格式避免数字精度问题 | String | 仅 file 类型返回 |
| isFavorite | 是否被收藏 | Boolean | 仅 type=filename 且 with_favorite_status=1 时返回 |
| eTag | 文件 ETag | String | 仅 file 类型返回 |
| crc64 | 文件的 CRC64-ECMA182 校验值 | String | 仅 file 类型返回 |
| metaData | 文件元数据信息 | Object | 仅 file 类型返回 |
| userId | 创建/更新者用户 ID | String | |
| previewByDoc | 是否可通过 WPS 预览 | Boolean | |
| previewByCI | 是否可通过万象预览 | Boolean | |
| previewAsIcon | 是否可使用预览图当做 icon | Boolean | |
| fileType | 文件类别，如 doc/image/video/archive 等 | String | |
| labels | 简易文件标签 | Array | |
| category | 自定义文件分类 | String | |
| localCreationTime | 文件对应的本地创建时间 | String | |
| localModificationTime | 文件对应的本地修改时间 | String | |
| text | 命中的正文片段 | String | 仅 type=filecontent 返回 |
| textPage | 命中片段所在文档页码（整数） | Number | 仅 type=filecontent 返回；PDF/DOCX/PPTX 等有分页的文档才有意义，纯文本类文档为 0 |
| searchScore | 服务端计算的匹配得分（分数越高越相关） | Number | 仅 type=filecontent 返回 |
| contentHighlight | 服务端侧的正文高亮片段对象 | Object | 仅 type=filecontent 返回 |

**contentHighlight 对象说明（仅 type=filecontent 返回）**

| 字段 | 说明 | 类型 |
|------|------|------|
| fragments | 高亮片段数组，关键词用 `<em>` 标签包裹 | Array\<String\> |

---

## 搜索文件 - 混合检索（MI）

### 功能说明

searchAI 使用一段自然语言关键字，在已开通白名单的媒体库/空间内，对文档/图片做多模态语义检索。
本接口涵盖 `type=text` 文搜文档（按自然语言语义检索文档类文件，含命中片段与页码）和 `type=pic` 文搜图（按自然语言语义做跨模态图片检索）两种子模式。

如需精准的文件名/正文关键字检索，请参考上方的「搜索目录与文件 - 基本检索（MI）」。

### 接口说明

- 该功能需开通白名单后使用；未开通时返回 HTTP 4xx。
- 本接口不支持翻页（无 marker / nextMarker）。
- `limit` 从 URL query 读取（不是请求体），默认 10；`type=text` 上限 30，`type=pic` 上限 100；超出上限、负数或非整数均返回 HTTP 4xx；`limit=0` 直接返回空列表。
- `keywords` 是 string（单一语义字符串，与基本检索的 string[] 不同），服务端会先做空白与特殊字符清洗，清洗后 rune 长度上限 60。
- 请求体大小上限 4 MB（超出返回 HTTP 4xx）。
- 本接口不支持 `creators` / `minFileSize` / `maxFileSize` / `scope` 四个字段，字段写了也无效。
- `type=text` 的文档索引可用性硬限制：支持格式 ∈ {pdf, png, jpg, jpeg, docx, doc, pptx, txt, md}；非图片类文档原始文件大小 ≤ 100 MB；图片类原始文件大小 ≤ 10 MB；单份文档最大 300 页；返回最大结果数量 ≤ 30。
- `type=pic` 的图片索引可用性硬限制：图像最长边 ≤ 7680 px；图像最短边 ≥ 32 px；原始文件大小 ≤ 10 MB；格式 ∈ {jpeg, jpg, png, bmp, webp}（仅支持静态图）。

### 使用示例

#### type=text（文搜文档）

```typescript
const res = await smh.search.searchAI({
    libraryId: 'your-library-id',
    spaceId: 'space-id-1',
    limit: 10,
    searchAIRequest: {
        type: 'text',
        keywords: '季度营收报告分析',
        inExtnames: ['.pdf', '.docx'],
        categories: ['document'],
    }
});
// 响应中每条结果包含 inode、score、text（命中片段）、textPage（页码）
```

#### type=pic（文搜图）

```typescript
const res = await smh.search.searchAI({
    libraryId: 'your-library-id',
    spaceId: 'space-id-1',
    limit: 20,
    searchAIRequest: {
        type: 'pic',
        keywords: '蓝天白云风景照片',
        inExtnames: ['.jpg', '.png'],
    }
});
// 响应中每条结果包含 inode、score
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| accessToken | 访问令牌 | String | 否 |
| librarySecret | 访问媒体库密钥 | String | 否 |
| userId | 用户身份识别 | String | 否 |
| limit | 本次返回的最大结果数量，默认 10；type=text 取值范围 [0, 30]，type=pic 取值范围 [0, 100] | Number | 否 |
| searchAIRequest | 搜索请求对象 | Object | 是 |

**searchAIRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|------|----------|------|----------|
| type | 子模式，取值 `text`（文搜文档）或 `pic`（文搜图）；非法值返回 HTTP 4xx | String | 是 |
| keywords | 搜索语句，字符串（不是数组），清洗后 rune 长度上限 60 | String | 是 |
| fileTypes | 文件类型，可选值：all、dir、file、symlink | Array | 否 |
| inExtnames | 包含的后缀，字符串数组，数组长度上限 20 | Array | 否 |
| excludeExtnames | 不包含的后缀，字符串数组，数组长度上限 20 | Array | 否 |
| categories | 文件自定义分类，字符串数组，数组长度上限 20 | Array | 否 |
| labels | 简易文件标签，字符串数组，数组长度上限 20 | Array | 否 |
| modificationTimeStart | 搜索更新时间范围起始，RFC3339 格式字符串 | String | 否 |
| modificationTimeEnd | 搜索更新时间范围结束，RFC3339 格式字符串 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

搜索成功，返回搜索结果。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| contents | 命中结果数组，数组长度 ≤ 本次请求的 limit | Array |

**contents 数组元素说明**

| 字段 | 说明 | 类型 | 备注 |
|------|------|------|------|
| inode | 命中文件的 inode | String | 两种 type 均返回 |
| score | 服务端计算的语义匹配得分（整数，分数越高越相关） | Number | 两种 type 均返回 |
| text | 命中文档片段 | String | 仅 type=text 返回 |
| textPage | 命中片段所在页码（整数） | Number | 仅 type=text 返回 |

---

## 搜索聚合统计

### 功能说明

searchFsStats 实现搜索目录与文件的聚合统计功能，支持按关键字、文件类型、文件大小等条件筛选后，对搜索结果进行分组（group）、计数（count）、去重计数（distinct）、求和（sum）、最小值（min）、最大值（max）、平均值（average）等聚合操作。

### 使用示例

```typescript
// 按文件后缀分组统计
const res = await smh.search.searchFsStats({
    searchFsStatsRequest: {
        keywords: ['报告文档'],
        aggregations: [
            { field: 'extName', operation: 'group' },
        ],
    },
});

// 多聚合项组合
const res2 = await smh.search.searchFsStats({
    searchFsStatsRequest: {
        keywords: ['项目文档'],
        aggregations: [
            { field: 'extName', operation: 'group' },
            { field: 'size', operation: 'sum' },
            { field: 'size', operation: 'count' },
        ],
    },
});

// 子聚合（嵌套聚合）
const res3 = await smh.search.searchFsStats({
    searchFsStatsRequest: {
        keywords: ['工作文档'],
        aggregations: [
            {
                field: 'extName',
                operation: 'group',
                subAggregations: [
                    { field: 'size', operation: 'sum' },
                    { field: 'size', operation: 'count' },
                ],
            },
        ],
    },
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| libraryId | 媒体库 ID | String | 是 |
| spaceId | 空间 ID | String | 是 |
| accessToken | 访问令牌 | String | 否 |
| userId | 用户身份识别 | String | 否 |
| librarySecret | 访问媒体库密钥 | String | 否 |
| searchFsStatsRequest | 搜索聚合统计请求对象 | Object | 是 |

**searchFsStatsRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|------|----------|------|----------|
| keywords | 搜索关键字，字符串数组，多个关键字之间为"或"的关系 | Array | 否 |
| scope | 搜索范围，指定搜索的目录 | String | 否 |
| inExtnames | 搜索文件后缀，字符串数组 | Array | 否 |
| excludeExtnames | 不包含的搜索文件后缀，字符串数组 | Array | 否 |
| fileTypes | 文件类型，可选值：file、dir、symlink | Array | 否 |
| minFileSize | 搜索文件大小范围（最小值），单位：字节 | Number | 否 |
| maxFileSize | 搜索文件大小范围（最大值），单位：字节 | Number | 否 |
| modificationTimeStart | 搜索更新时间范围（开始时间），时间戳字符串 | String | 否 |
| modificationTimeEnd | 搜索更新时间范围（结束时间），时间戳字符串 | String | 否 |
| labels | 简易文件标签，字符串数组 | Array | 否 |
| categories | 文件自定义分类信息，字符串数组 | Array | 否 |
| aggregations | 聚合统计数组，最多 5 个聚合项 | Array | 是 |

**aggregations 数组元素说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|------|----------|------|----------|
| field | 聚合字段名 | String | 是 |
| operation | 聚合操作 | String | 是 |
| subAggregations | 子聚合数组，仅当 operation 为 group 时有效，最多 3 个子聚合项 | Array | 否 |

**支持的聚合字段（field）**

| 字段值 | 说明 | 支持的操作 |
|--------|------|-----------|
| extName | 文件后缀 | group, count, distinct |
| category | 文件分类 | group, count, distinct |
| size | 文件大小（Byte） | count, distinct, sum, min, max, average |
| contentType | 媒体类型 | group, count, distinct |
| userId | 创建/更新者用户 ID | group, count, distinct |
| name | 文件名 | count, distinct |
| fileType | 文件类型（内部数值） | group, count, distinct |

**支持的聚合操作（operation）**

| 操作值 | 说明 |
|--------|------|
| group | 分组聚合，按字段值分组 |
| count | 计数，统计匹配的文档数 |
| distinct | 去重计数，统计字段的不同值数量 |
| sum | 求和（仅适用于数值类型字段，如 size） |
| min | 最小值（仅适用于数值类型字段） |
| max | 最大值（仅适用于数值类型字段） |
| average | 平均值（仅适用于数值类型字段） |

**subAggregations 数组元素说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|------|----------|------|----------|
| field | 子聚合字段名，支持的字段同 aggregations | String | 是 |
| operation | 子聚合操作，不支持 group（即不支持多层嵌套分组） | String | 是 |

### 返回值说明

**HTTP 状态码：200**

搜索聚合统计成功，返回聚合结果。

**响应示例**

```json
{
  "isTruncated": false,
  "aggregations": [
    {
      "field": "extName",
      "operation": "group",
      "groups": [
        {
          "value": ".pdf",
          "count": 15,
          "subAggregations": [
            { "field": "size", "operation": "sum", "value": 52428800 }
          ]
        },
        {
          "value": ".doc",
          "count": 8
        }
      ]
    },
    {
      "field": "size",
      "operation": "sum",
      "value": 73400320
    }
  ]
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| isTruncated | 返回的分组数据是否被截断，当实际分组数量超过最大限制（默认2000）时返回 true | Boolean |
| aggregations | 聚合统计结果数组，与请求中的 aggregations 一一对应 | Array |

**aggregations 数组元素说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| field | 聚合字段名 | String |
| operation | 聚合操作名 | String |
| value | 当 operation 为 sum、min、max、average、count、distinct 时返回，表示聚合计算结果 | Number |
| groups | 当 operation 为 group 时返回，分组结果数组 | Array |

**groups 数组元素说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| value | 分组的键值（如后缀名 ".pdf"、分类名 "image" 等） | String |
| count | 该分组下的文档数量 | Number |
| subAggregations | 子聚合结果，当请求中指定了子聚合时返回 | Array |

**subAggregations 数组元素说明（响应）**

| 字段 | 说明 | 类型 |
|------|------|------|
| field | 子聚合字段名 | String |
| operation | 子聚合操作名 | String |
| value | 子聚合计算结果 | Number |

---
